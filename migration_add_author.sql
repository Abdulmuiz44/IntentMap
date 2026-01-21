-- Add 'author' column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS author TEXT;
