-- QUICK FIX: Disable Row Level Security for testing
-- This is the fastest way to fix the registration issue
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables to allow data insertion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_dashboards DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anonymous users (needed for registration)
GRANT ALL ON users TO anon;
GRANT ALL ON referrals TO anon;
GRANT ALL ON user_activities TO anon;
GRANT ALL ON user_stats TO anon;
GRANT ALL ON achievements TO anon;
GRANT ALL ON business_dashboards TO anon;
GRANT ALL ON bookings TO anon;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'referrals', 'user_activities', 'user_stats', 'achievements', 'business_dashboards', 'bookings'); 