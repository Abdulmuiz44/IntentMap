import { Composio } from "@composio/core";
import Bottleneck from "bottleneck";
import { IntentEngine } from "./engine";
import { AnalysisResult } from "./utils/schemas";
import { RedditPostSchema } from "./utils/schemas";
import { logger } from "./utils/logger";
import { withRetry } from "./utils/retry";
import { supabase } from "./services/supabase";
import { sendLeadAlert } from "./notifier";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const SUBREDDITS = ["SaaS", "IndieHackers", "SideProject"];
const KEYWORDS = ["validation", "no sales", "alternative to", "struggling"];
const POST_LIMIT = 10; // Composio might have limits

// Rate Limiting
const limiter = new Bottleneck({
  minTime: 2000,
  maxConcurrent: 1
});

export class RedditScraper {
  private composio: Composio;
  private engine: IntentEngine;

  constructor() {
    this.engine = new IntentEngine();
    
    const composioApiKey = process.env.COMPOSIO_API_KEY;

    if (!composioApiKey) {
      throw new Error("Missing COMPOSIO_API_KEY in .env");
    }

    this.composio = new Composio({
      apiKey: composioApiKey,
    });
    
    logger.info("Composio Client Initialized.");
  }

  private matchesKeywords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return KEYWORDS.some((keyword) => lowerText.includes(keyword));
  }

  private async processPost(post: any) {
    // Map Composio response to our schema
    // The response structure depends on Composio, but usually mirrors Reddit API
    // We'll try to map common fields
    const mappedPost = {
        id: post.id || post.name || Math.random().toString(36).substring(7),
        title: post.title || "No Title",
        selftext: post.selftext || post.text || "",
        author: { name: post.author || "unknown" },
        permalink: post.permalink || "",
        url: post.url || "",
        created_utc: post.created_utc || Date.now() / 1000
    };

    const safePostResult = RedditPostSchema.safeParse(mappedPost);

    if (!safePostResult.success) {
        logger.debug(`Skipping invalid post structure: ${mappedPost.id}`, { errors: safePostResult.error });
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

  private async saveLead(post: any, analysis: AnalysisResult) {
      try {
          const { error } = await supabase.from('leads').upsert({
              reddit_post_id: post.id,
              platform: 'reddit',
              post_url: post.permalink.startsWith('http') ? post.permalink : `https://reddit.com${post.permalink}`,
              title: post.title,
              selftext: post.selftext,
              author: post.author.name,
              pain_score: analysis.pain_score,
              wtp_signal: analysis.wtp_signal,
              ai_analysis: analysis,
              updated_at: new Date().toISOString()
          }, { onConflict: 'reddit_post_id' });

          if (error) {
              logger.error('Failed to save lead to Supabase', { error });
          } else {
              logger.info(`Lead saved successfully: ${post.id}`);
              
              if (analysis.pain_score >= 8) {
                  await sendLeadAlert({
                      postTitle: post.title,
                      painScore: analysis.pain_score,
                      hardPainSummary: analysis.hard_pain_summary || "Pain detected, check post for details.",
                      momTestQuestion: analysis.mom_test_question || "Could you tell me more about how this impacts your workflow?",
                      postUrl: post.permalink.startsWith('http') ? post.permalink : `https://reddit.com${post.permalink}`
                  });
              }
          }
      } catch (err) {
          logger.error('Database error during saveLead', { err });
      }
  }

  async scanSubreddit(subName: string) {
      logger.info(`Scanning r/${subName} via Composio...`);
      try {
        // Execute the action using Composio
        const response = await limiter.schedule(() => 
            withRetry(async () => {
                 // Based on TS definition, it seems to expect properties directly, but let's try strict object structure
                 // Casting to any to bypass the restrictive type definition that seems outdated or mismatching
                 return await this.composio.tools.execute("REDDIT_GET_SUBREDDIT_POSTS", {
                     subreddit: subName,
                     limit: POST_LIMIT
                 } as any);
            }, 3, 5000, `Fetch r/${subName}`)
        );

        // Composio response structure usually has 'data' or is the data itself
        let posts: any[] = [];
        const responseData = response as any; // Cast to any to handle structure

        if (responseData && responseData.data) {
            posts = Array.isArray(responseData.data) ? responseData.data : [];
        } else if (Array.isArray(responseData)) {
            posts = responseData;
        } else if (responseData && responseData.items) {
            posts = responseData.items;
        }

        if (!posts || posts.length === 0) {
             logger.warn(`No posts found or unknown response structure for r/${subName}`, { responseKeys: Object.keys(responseData || {}) });
             return;
        }

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

