-- Run this in the Supabase SQL Editor

-- Create the posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add CHECK constraint for message length (1-280 characters)
ALTER TABLE posts ADD CONSTRAINT message_length_check 
  CHECK (char_length(message) >= 1 AND char_length(message) <= 280);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to SELECT
CREATE POLICY "Anyone can select posts" 
  ON posts FOR SELECT 
  USING (true);

-- Create policy to allow anyone to INSERT
CREATE POLICY "Anyone can insert posts" 
  ON posts FOR INSERT 
  WITH CHECK (true);

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
