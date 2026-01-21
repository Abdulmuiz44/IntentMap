-- Create the new table for the new scanner engine
CREATE TABLE IF NOT EXISTS intent_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  author TEXT,
  content TEXT,
  url TEXT UNIQUE, -- Avoid duplicates
  score INTEGER,
  pain_point TEXT,
  intent_category TEXT,
  drafted_reply TEXT,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
