import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder';
};

export interface Lead {
  id: string;
  source: string;
  author: string;
  content: string;
  url: string;
  score: number;
  pain_point: string;
  intent_category: 'Switching' | 'NewSearch' | 'Complaint' | 'None';
  drafted_reply: string;
  synced: boolean;
  created_at: string;
}