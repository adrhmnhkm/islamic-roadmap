-- Islamic Roadmap Database Schema
-- Extended Profile Management - SAFE VERSION

-- Create custom types (safe - won't error if exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users) - ONLY CREATE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to users table if they don't exist (SAFE)
DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN role user_role DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT true;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN full_name VARCHAR(255);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Admin permissions table - ONLY CREATE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}',
  granted_by UUID REFERENCES public.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create user_profiles table for extended user information - ONLY IF NOT EXISTS
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

-- Enable Row Level Security (safe - won't error if already enabled)
DO $$ BEGIN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- Create storage bucket (safe - uses ON CONFLICT)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes (safe - uses IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_learning_level ON user_profiles(learning_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_language ON user_profiles(preferred_language);

-- Create indexes for users table (safe)
DO $$ BEGIN
    CREATE INDEX idx_users_role ON public.users(role);
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_users_email ON public.users(email);
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

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

-- Helper functions for role checking (SAFE - handles missing columns)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND COALESCE(role, 'user'::user_role) IN ('admin', 'super_admin')
    AND COALESCE(is_active, true) = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND COALESCE(role, 'user'::user_role) = 'super_admin'
    AND COALESCE(is_active, true) = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT COALESCE(role, 'user'::user_role) INTO user_role_result
  FROM public.users 
  WHERE id = auth.uid() 
  AND COALESCE(is_active, true) = true;
  
  RETURN COALESCE(user_role_result, 'user'::user_role);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'user'::user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.admin_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_complete_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;

-- Enable Row Level Security (safe)
DO $$ BEGIN
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- Create policies (safe - will replace if exists)
-- Users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
CREATE POLICY "Super admins can manage all users" ON public.users
  FOR ALL USING (is_super_admin());

-- Admin permissions policies
DROP POLICY IF EXISTS "Admins can view their own permissions" ON public.admin_permissions;
CREATE POLICY "Admins can view their own permissions" ON public.admin_permissions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.admin_permissions;
CREATE POLICY "Super admins can manage all permissions" ON public.admin_permissions
  FOR ALL USING (is_super_admin());

-- User profiles policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;
CREATE POLICY "Users can manage their own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (is_admin());

-- Storage policies (safe - will replace if exists)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
CREATE POLICY "Anyone can upload an avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can update their own avatar" ON storage.objects;
CREATE POLICY "Anyone can update their own avatar" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Create triggers (safe - will replace if exists)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default super admin (safe - uses ON CONFLICT)
-- GANTI EMAIL INI DENGAN EMAIL ANDA!
DO $$ 
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  SELECT 
    auth.users.id,
    auth.users.email,
    COALESCE(auth.users.raw_user_meta_data->>'full_name', auth.users.email),
    'super_admin'::user_role
  FROM auth.users 
  WHERE auth.users.email = 'adrhmnhkm@gmail.com' -- GANTI DENGAN EMAIL ANDA!
  ON CONFLICT (id) DO UPDATE SET 
    role = 'super_admin',
    updated_at = NOW();
EXCEPTION
  WHEN OTHERS THEN null;
END $$; 