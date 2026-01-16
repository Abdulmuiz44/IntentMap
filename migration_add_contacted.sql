-- Add 'contacted' column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacted BOOLEAN DEFAULT FALSE;
