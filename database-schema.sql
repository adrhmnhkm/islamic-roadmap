-- Islamic Roadmap Database Schema
-- Extended Profile Management

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  date_of_birth DATE,
  
  -- Learning Preferences
  preferred_language TEXT DEFAULT 'indonesia' CHECK (preferred_language IN ('indonesia', 'english', 'arabic')),
  learning_level TEXT DEFAULT 'beginner' CHECK (learning_level IN ('beginner', 'intermediate', 'advanced')),
  favorite_topics TEXT[] DEFAULT '{}',
  study_time_preference TEXT DEFAULT 'evening' CHECK (study_time_preference IN ('morning', 'afternoon', 'evening', 'night')),
  
  -- Notification Preferences
  notification_email BOOLEAN DEFAULT true,
  notification_reminders BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create avatars storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for avatars storage
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update their own avatar" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_learning_level ON user_profiles(learning_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_language ON user_profiles(preferred_language);

-- Sample data (optional - for testing)
-- Uncomment the following if you want to add sample data

-- INSERT INTO user_profiles (user_id, first_name, last_name, bio, location, preferred_language, learning_level, favorite_topics)
-- VALUES 
--   ('your-user-id-here', 'Ahmad', 'Rahman', 'Seorang pelajar Islam yang ingin memperdalam ilmu agama', 'Jakarta, Indonesia', 'indonesia', 'beginner', ARRAY['quran', 'hadith']),
--   ('another-user-id', 'Fatimah', 'Zahra', 'Mahasiswi yang tertarik dengan kajian tafsir Al-Quran', 'Bandung, Indonesia', 'indonesia', 'intermediate', ARRAY['quran', 'tafsir', 'arabic']);

-- Views for easier data access
CREATE OR REPLACE VIEW user_profiles_with_auth AS
SELECT 
  up.*,
  u.email,
  u.created_at as auth_created_at,
  u.updated_at as auth_updated_at
FROM user_profiles up
JOIN auth.users u ON up.user_id = u.id;

-- Function to get user's complete profile
CREATE OR REPLACE FUNCTION get_user_complete_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  date_of_birth DATE,
  age INTEGER,
  preferred_language TEXT,
  learning_level TEXT,
  favorite_topics TEXT[],
  study_time_preference TEXT,
  notification_email BOOLEAN,
  notification_reminders BOOLEAN,
  profile_created_at TIMESTAMP WITH TIME ZONE,
  profile_updated_at TIMESTAMP WITH TIME ZONE,
  auth_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    au.email::TEXT,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1))::TEXT as username,
    up.first_name,
    up.last_name,
    COALESCE(up.first_name || ' ' || up.last_name, COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)))::TEXT as full_name,
    up.bio,
    up.location,
    up.phone,
    up.date_of_birth,
    CASE 
      WHEN up.date_of_birth IS NOT NULL 
      THEN EXTRACT(YEAR FROM AGE(up.date_of_birth))::INTEGER
      ELSE NULL
    END as age,
    up.preferred_language,
    up.learning_level,
    up.favorite_topics,
    up.study_time_preference,
    up.notification_email,
    up.notification_reminders,
    up.created_at as profile_created_at,
    up.updated_at as profile_updated_at,
    au.created_at as auth_created_at
  FROM user_profiles up
  JOIN auth.users au ON up.user_id = au.id
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_complete_profile(UUID) TO authenticated; 