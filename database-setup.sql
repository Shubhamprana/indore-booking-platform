-- Database Setup for Indore Booking Platform (Run in Supabase SQL Editor)
-- Copy and paste these commands ONE BY ONE into Supabase SQL Editor

-- 1. CREATE FOLLOWS TABLE (Run this first)
CREATE TABLE IF NOT EXISTS follows (
  id bigserial PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id)
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES FOR FOLLOWS TABLE
CREATE POLICY "Users can view all follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can insert their own follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- 4. CREATE ESSENTIAL INDEXES (Run each one separately)
-- Core indexes for user operations
CREATE INDEX idx_users_user_type ON auth.users USING btree(raw_user_meta_data->>'user_type');
CREATE INDEX idx_users_business_name ON auth.users USING btree((raw_user_meta_data->>'business_name'));
CREATE INDEX idx_users_location ON auth.users USING btree((raw_user_meta_data->>'location'));

-- Critical indexes for follow operations  
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- 5. CREATE USERS VIEW FOR EASIER QUERYING
CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  raw_user_meta_data->>'business_name' as business_name,
  raw_user_meta_data->>'business_category' as business_category,
  raw_user_meta_data->>'business_description' as business_description,
  raw_user_meta_data->>'location' as location,
  raw_user_meta_data->>'profile_image_url' as profile_image_url,
  COALESCE((raw_user_meta_data->>'user_type'), 'customer') as user_type,
  0 as followers_count,
  0 as following_count,
  created_at,
  updated_at
FROM auth.users;

-- 6. CREATE RLS POLICY FOR USERS VIEW
CREATE POLICY "Users can view all users" ON auth.users FOR SELECT USING (true);

-- 7. CREATE ESSENTIAL FUNCTIONS

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_followers_count(p_user_id uuid, p_increment integer)
RETURNS void AS $$
BEGIN
  -- This is a placeholder function since we can't directly update auth.users
  -- In production, you might want to store counts in a separate table
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update following counts  
CREATE OR REPLACE FUNCTION update_following_count(p_user_id uuid, p_increment integer)
RETURNS void AS $$
BEGIN
  -- This is a placeholder function since we can't directly update auth.users
  -- In production, you might want to store counts in a separate table
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREATE SEARCH FUNCTION
CREATE OR REPLACE FUNCTION search_business_users(
  p_query text DEFAULT '',
  p_current_user_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
) RETURNS TABLE(
  id uuid,
  full_name text,
  business_name text,
  business_category text,
  business_description text,
  location text,
  profile_image_url text,
  followers_count integer,
  following_count integer,
  is_following boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email) as full_name,
    u.raw_user_meta_data->>'business_name' as business_name,
    u.raw_user_meta_data->>'business_category' as business_category,
    u.raw_user_meta_data->>'business_description' as business_description,
    u.raw_user_meta_data->>'location' as location,
    u.raw_user_meta_data->>'profile_image_url' as profile_image_url,
    COALESCE((
      SELECT COUNT(*)::integer 
      FROM follows 
      WHERE following_id = u.id
    ), 0) as followers_count,
    COALESCE((
      SELECT COUNT(*)::integer 
      FROM follows 
      WHERE follower_id = u.id
    ), 0) as following_count,
    COALESCE((
      SELECT true 
      FROM follows 
      WHERE follower_id = p_current_user_id 
      AND following_id = u.id
    ), false) as is_following,
    u.created_at
  FROM auth.users u
  WHERE 
    COALESCE(u.raw_user_meta_data->>'user_type', 'customer') = 'business'
    AND (
      p_query = '' 
      OR u.raw_user_meta_data->>'full_name' ILIKE '%' || p_query || '%'
      OR u.raw_user_meta_data->>'business_name' ILIKE '%' || p_query || '%'
      OR u.raw_user_meta_data->>'business_category' ILIKE '%' || p_query || '%'
      OR u.raw_user_meta_data->>'location' ILIKE '%' || p_query || '%'
    )
  ORDER BY 
    (SELECT COUNT(*) FROM follows WHERE following_id = u.id) DESC,
    u.created_at DESC
  LIMIT p_limit 
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. GRANT NECESSARY PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT ALL ON follows TO authenticated;
GRANT EXECUTE ON FUNCTION search_business_users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_followers_count TO authenticated;
GRANT EXECUTE ON FUNCTION update_following_count TO authenticated; 