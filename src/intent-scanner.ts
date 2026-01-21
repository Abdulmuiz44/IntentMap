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
    "best tool for"
  ],
  competitors: [
    "Salesforce",
    "HubSpot",
    "ZoomInfo",
    "Apollo.io"
  ]
};

// --- 2. Mock Scraper ---
interface RawPost {
  id: string;
  source: 'Reddit' | 'X' | 'LinkedIn';
  author: string;
  content: string;
  url: string;
  timestamp: string;
}

async function mockScraper(target: string): Promise<RawPost[]> {
  console.log(`[Scraper] Fetching data from ${target} using axios...`);
  
  // In a real scenario, we would use axios to fetch the page/API:
  // const response = await axios.get(`https://api.social-media.com/feed/${target}`);
  // return response.data;

  // Mocking the delay and response
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockPosts: RawPost[] = [
    {
      id: "post_101",
      source: "Reddit",
      author: "SaaS_Founder_99",
      content: "I'm tired of Salesforce being so bloated and expensive. Is there a lightweight alternative that just handles lead enrichment well?",
      url: "https://reddit.com/r/saas/post_101",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_102",
      source: "X",
      author: "@growth_marketer",
      content: "Just launched my new course! Check it out.",
      url: "https://x.com/growth_marketer/status/102",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_103",
      source: "Reddit",
      author: "dev_dude",
      content: "Anyone know a good tool for intent data? ZoomInfo is out of our budget.",
      url: "https://reddit.com/r/startups/post_103",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_104",
      source: "LinkedIn",
      author: "Jane Doe",
      content: "Excited to announce I'm starting a new position!",
      url: "https://linkedin.com/feed/update/104",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_105",
      source: "Reddit",
      author: "cto_guy",
      content: "Looking for a tool for tracking competitor pricing changes automatically. Suggestions?",
      url: "https://reddit.com/r/marketing/post_105",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_106",
      source: "X",
      author: "@indie_hacker",
      content: "Building in public day 45. MRR is flat.",
      url: "https://x.com/indie_hacker/status/106",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_107",
      source: "Reddit",
      author: "marketing_guru",
      content: "HubSpot is great but the pricing tiers are confusing. Thinking of switching.",
      url: "https://reddit.com/r/sales/post_107",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_108",
      source: "X",
      author: "@tech_enthusiast",
      content: "Does anyone have a recommendation for a CRM that integrates well with Gmail?",
      url: "https://x.com/tech_enthusiast/status/108",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_109",
      source: "Reddit",
      author: "startups_fan",
      content: "What is the best way to validate a SaaS idea?",
      url: "https://reddit.com/r/startups/post_109",
      timestamp: new Date().toISOString()
    },
    {
      id: "post_110",
      source: "X",
      author: "@vc_thought_leader",
      content: "AI is eating the world.",
      url: "https://x.com/vc_thought_leader/status/110",
      timestamp: new Date().toISOString()
    }
  ];

  return mockPosts;
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

  const prompt = `
    Analyze the following social media post for B2B buying intent.
    We are looking for users who need a B2B SaaS intelligence tool (like IntentMap) or are unhappy with competitors.
    
    Post Content: "${text}"
    
    Keywords to watch for: ${JSON.stringify(KEYWORD_MAP)}
    
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
  console.log("Starting IntentMap Engine...");

  // 1. Fetch Posts
  const posts = await mockScraper("r/saas");
  console.log(`Fetched ${posts.length} posts.`);

  for (const post of posts) {
    // Basic keyword pre-filtering (optional optimization)
    const hasKeyword = KEYWORD_MAP.buying_signals.some(k => post.content.toLowerCase().includes(k.toLowerCase())) ||
                       KEYWORD_MAP.competitors.some(c => post.content.includes(c));
    
    // We send everything to AI in this demo for accuracy, but you could skip non-keyword posts here.
    
    // 2. Analyze Intent
    const analysis = await analyzeIntent(post.content);
    
    console.log(`Analyzed post ${post.id}: Score ${analysis.score} (${analysis.intent_category})`);

    // 3. Save High Intent Leads
    if (analysis.score > 7) {
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
  }

  console.log("Scan complete.");
}

main().catch(console.error);