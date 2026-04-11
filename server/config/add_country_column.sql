-- Add country column to profiles table
-- Run this in Supabase SQL Editor if you already have the profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
