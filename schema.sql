-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reddit_post_id TEXT NOT NULL UNIQUE, -- Unique constraint for deduplication
  platform TEXT NOT NULL,
  post_url TEXT NOT NULL,
  title TEXT,
  selftext TEXT,
  pain_score INTEGER,
  wtp_signal BOOLEAN DEFAULT FALSE,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);