import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Lead {
  id: string;
  platform: string;
  post_url: string;
  title: string;
  selftext: string;
  pain_score: number;
  wtp_signal: boolean;
  ai_analysis: {
    pain_score: number;
    wtp_signal: boolean;
    hard_pain_summary: string;
    mom_test_question: string;
    is_high_intent: boolean;
  };
  contacted: boolean;
  created_at: string;
  reddit_post_id: string;
}
