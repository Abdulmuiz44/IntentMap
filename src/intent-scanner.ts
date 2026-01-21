import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

// --- Configuration ---
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
  console.error("Missing environment variables. Please check .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- 1. Keyword Map ---
const KEYWORD_MAP = {
  buying_signals: [
    "alternative to",
    "competitor to",
    "looking for a tool",
    "recommend a software",
    "painful to use",
    "switching from",
    "too expensive",
    "help me find",
    "best tool for",
    "vs",
    "review",
    "pricing"
  ],
  competitors: [
    "Salesforce",
    "HubSpot",
    "ZoomInfo",
    "Apollo.io",
    "Pipedrive",
    "Monday.com",
    "ClickUp",
    "Jira"
  ]
};

// --- 2. Real Scraper (Reddit) ---
interface RawPost {
  id: string;
  source: 'Reddit';
  author: string;
  content: string;
  url: string;
  timestamp: string;
}

async function fetchRedditPosts(subreddit: string): Promise<RawPost[]> {
  console.log(`[Scraper] Fetching real data from r/${subreddit}...`);
  
  try {
    const response = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json?limit=25`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const posts = response.data.data.children.map((child: any) => {
      const data = child.data;
      return {
        id: data.id,
        source: 'Reddit' as const,
        author: `u/${data.author}`,
        content: `${data.title}\n\n${data.selftext}`,
        url: `https://www.reddit.com${data.permalink}`,
        timestamp: new Date(data.created_utc * 1000).toISOString()
      };
    });

    return posts;
  } catch (error) {
    console.error(`Error fetching from r/${subreddit}:`, error);
    return [];
  }
}

// --- 3. AI Analysis ---
interface IntentAnalysis {
  score: number;
  pain_point: string;
  intent_category: "Switching" | "NewSearch" | "Complaint" | "None";
  drafted_reply: string;
}

const analysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.NUMBER, description: "A score from 1 to 10 indicating buying intent strength." },
    pain_point: { type: SchemaType.STRING, description: "The specific problem or need the user is expressing." },
    intent_category: { 
      type: SchemaType.STRING, 
      description: "Category of the intent. Must be one of: Switching, NewSearch, Complaint, None"
    },
    drafted_reply: { type: SchemaType.STRING, description: "A helpful, non-salesy reply suggesting our solution (IntentMap) or offering advice." }
  },
  required: ["score", "pain_point", "intent_category", "drafted_reply"]
};

async function analyzeIntent(text: string): Promise<IntentAnalysis> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    }
  });

  // Truncate text if too long to save tokens
  const truncatedText = text.slice(0, 1000);

  const prompt = `
    Analyze the following social media post for B2B buying intent.
    We are looking for users who need business software, B2B tools, or are unhappy with competitors.
    
    Post Content: "${truncatedText}"
    
    Keywords context: ${JSON.stringify(KEYWORD_MAP)}
    
    Return a JSON object with:
    - score: 1-10 (10 = high intent to buy/switch, 1 = no intent).
    - pain_point: Brief description of their problem.
    - intent_category: "Switching", "NewSearch", "Complaint", or "None".
    - drafted_reply: A draft response.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText) as IntentAnalysis;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { score: 0, pain_point: "Error", intent_category: "None", drafted_reply: "" };
  }
}

// --- 4. Main Engine ---
async function main() {
  console.log("Starting IntentMap Engine (Real Data Mode)...");

  // Subreddits to scan
  const subreddits = ['SaaS', 'startups', 'entrepreneur', 'marketing', 'sales'];
  
  for (const sub of subreddits) {
      const posts = await fetchRedditPosts(sub);
      console.log(`Fetched ${posts.length} posts from r/${sub}.`);

      for (const post of posts) {
        // 1. Basic Keyword Filtering (Optimization)
        // Only analyze if it matches at least one keyword to save AI cost/time
        const lowerContent = post.content.toLowerCase();
        const hasKeyword = KEYWORD_MAP.buying_signals.some(k => lowerContent.includes(k.toLowerCase())) ||
                           KEYWORD_MAP.competitors.some(c => lowerContent.includes(c.toLowerCase()));
        
        if (!hasKeyword) {
            // console.log(`Skipping post ${post.id} (no keywords)`);
            continue; 
        }

        console.log(`Analyzing candidate: ${post.title?.slice(0, 50) || post.content.slice(0, 50)}...`);

        // 2. Check if already exists to avoid re-analysis
        const { data: existing } = await supabase
            .from('intent_leads')
            .select('id')
            .eq('url', post.url)
            .single();

        if (existing) {
            console.log("Skipping duplicate.");
            continue;
        }

        // 3. Analyze Intent
        const analysis = await analyzeIntent(post.content);
        
        console.log(` -> Score: ${analysis.score} (${analysis.intent_category})`);

        // 4. Save High Intent Leads
        if (analysis.score >= 6) { // Lowered threshold slightly to catch more interesting signals
          console.log(`>>> High Intent Found! Saving lead from ${post.author}...`);
          
          const { error } = await supabase
            .from('intent_leads')
            .insert({
              source: post.source,
              author: post.author,
              content: post.content,
              url: post.url,
              score: analysis.score,
              pain_point: analysis.pain_point,
              intent_category: analysis.intent_category,
              drafted_reply: analysis.drafted_reply,
              created_at: new Date().toISOString()
            });

          if (error) {
            console.error("Error saving to Supabase:", error.message);
          } else {
            console.log("Saved successfully.");
          }
        }
        
        // Rate limiting to be nice
        await new Promise(r => setTimeout(r, 1000));
      }
  }

  console.log("Scan complete.");
}

main().catch(console.error);
