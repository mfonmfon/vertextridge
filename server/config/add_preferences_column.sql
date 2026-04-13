-- Add preferences column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON profiles USING GIN (preferences);
