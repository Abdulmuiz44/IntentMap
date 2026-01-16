import Snoowrap from "snoowrap";
import Bottleneck from "bottleneck";
import { IntentEngine } from "./engine";
import { AnalysisResult } from "./utils/schemas";
import { RedditPostSchema } from "./utils/schemas";
import { logger } from "./utils/logger";
import { withRetry } from "./utils/retry";
import { supabase } from "./services/supabase";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const SUBREDDITS = ["SaaS", "IndieHackers"];
const KEYWORDS = ["validation", "no sales", "alternative to", "struggling"];
const POST_LIMIT = 20;

// Rate Limiting: 1 request per second (safe for Reddit's 60/min)
const limiter = new Bottleneck({
  minTime: 2000, // Be even safer, 1 req every 2s
  maxConcurrent: 1
});

export class RedditScraper {
  private r: Snoowrap;
  private engine: IntentEngine;

  constructor() {
    this.engine = new IntentEngine();
    
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const refreshToken = process.env.REDDIT_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error("Missing Reddit credentials in .env");
    }

    this.r = new Snoowrap({
      userAgent: "intentmap.biz/1.0.0",
      clientId,
      clientSecret,
      refreshToken,
    });
    
    this.r.config({ continueAfterRatelimitError: true });
  }

  private matchesKeywords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return KEYWORDS.some((keyword) => lowerText.includes(keyword));
  }

  private async processPost(post: Snoowrap.Submission) {
    // Validate Structure using Zod
    // Note: Snoowrap objects are complex, we pick what we need
    const safePostResult = RedditPostSchema.safeParse({
        id: post.id,
        title: post.title,
        selftext: post.selftext,
        author: { name: post.author.name },
        permalink: post.permalink,
        url: post.url,
        created_utc: post.created_utc
    });

    if (!safePostResult.success) {
        // Debug log only to avoid spamming if schema mismatches slightly
        logger.debug(`Skipping invalid post structure: ${post.id}`, { errors: safePostResult.error });
        return;
    }
    const safePost = safePostResult.data;

    const content = `${safePost.title} 
 ${safePost.selftext}`;
    
    if (!this.matchesKeywords(content)) {
        return;
    }

    logger.info(`Analyzing post: "${safePost.title.substring(0, 30)}"... (${safePost.id})`);
    
    const analysis = await this.engine.analyze(content);

    if (analysis.is_high_intent) {
        logger.info(`🔥 High Intent Lead found: ${safePost.title}`);
        await this.saveLead(safePost, analysis);
    } else {
        logger.info(`Low intent (${analysis.pain_score}/10). Skipping.`);
    }
  }

  private async saveLead(post: Snoowrap.Submission | any, analysis: AnalysisResult) {
      try {
          const { error } = await supabase.from('leads').upsert({
              reddit_post_id: post.id,
              platform: 'reddit',
              post_url: `https://reddit.com${post.permalink}`,
              title: post.title,
              selftext: post.selftext,
              pain_score: analysis.pain_score,
              wtp_signal: analysis.wtp_signal,
              ai_analysis: analysis,
              updated_at: new Date().toISOString()
          }, { onConflict: 'reddit_post_id' });

          if (error) {
              logger.error('Failed to save lead to Supabase', { error });
          } else {
              logger.info(`Lead saved successfully: ${post.id}`);
          }
      } catch (err) {
          logger.error('Database error during saveLead', { err });
      }
  }

  async scanSubreddit(subName: string) {
      logger.info(`Scanning r/${subName}...`);
      try {
        // Wrap getNew in bottleneck and retry
        // cast to any to avoid snoowrap types hell
        const posts = await limiter.schedule(() => 
            withRetry(async () => {
                 return await this.r.getSubreddit(subName).getNew({ limit: POST_LIMIT });
            }, 3, 5000, `Fetch r/${subName}`)
        );

        logger.info(`Fetched ${posts.length} posts from r/${subName}. Processing...`);

        for (const post of posts) {
            await this.processPost(post);
        }
      } catch (error) {
          logger.error(`Error scanning r/${subName}`, { error });
      }
  }

  async run() {
    for (const subName of SUBREDDITS) {
        await this.scanSubreddit(subName);
    }
  }
}