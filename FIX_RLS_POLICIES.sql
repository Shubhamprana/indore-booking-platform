-- FIX RLS POLICIES: Allow user registration and data access
-- Run this in your Supabase SQL Editor to fix the permission issues

-- 1. Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'referrals', 'user_activities', 'user_stats', 'achievements', 'business_dashboards', 'bookings');

-- 2. Option A: Disable RLS temporarily for testing (QUICK FIX)
-- Uncomment these lines if you want to disable RLS completely for testing:

-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE business_dashboards DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- 3. Option B: Create proper RLS policies (RECOMMENDED)
-- This allows proper access control while enabling functionality

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow public registration" ON users;

DROP POLICY IF EXISTS "Users can view their referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert referrals" ON referrals;

DROP POLICY IF EXISTS "Users can view their activities" ON user_activities;
DROP POLICY IF EXISTS "Users can insert activities" ON user_activities;

DROP POLICY IF EXISTS "Users can view their stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert/update stats" ON user_stats;

DROP POLICY IF EXISTS "Users can view their achievements" ON achievements;
DROP POLICY IF EXISTS "Users can insert achievements" ON achievements;

DROP POLICY IF EXISTS "Users can view their business dashboard" ON business_dashboards;
DROP POLICY IF EXISTS "Users can insert/update business dashboard" ON business_dashboards;

DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Business owners can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert bookings" ON bookings;

-- USERS TABLE POLICIES
-- Allow anyone to register (insert new users)
CREATE POLICY "Allow public registration" ON users
    FOR INSERT 
    WITH CHECK (true);

-- Allow users to view their own data
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT 
    USING (auth.uid() = id::uuid OR auth.uid() IS NULL);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE 
    USING (auth.uid() = id::uuid)
    WITH CHECK (auth.uid() = id::uuid);

-- REFERRALS TABLE POLICIES
-- Allow users to view referrals where they are the referrer or referred user
CREATE POLICY "Users can view their referrals" ON referrals
    FOR SELECT 
    USING (auth.uid() = referrer_id::uuid OR auth.uid() = referred_user_id::uuid OR auth.uid() IS NULL);

-- Allow inserting referrals
CREATE POLICY "Users can insert referrals" ON referrals
    FOR INSERT 
    WITH CHECK (true);

-- USER ACTIVITIES TABLE POLICIES
-- Allow users to view their own activities
CREATE POLICY "Users can view their activities" ON user_activities
    FOR SELECT 
    USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL);

-- Allow inserting activities
CREATE POLICY "Users can insert activities" ON user_activities
    FOR INSERT 
    WITH CHECK (true);

-- USER STATS TABLE POLICIES
-- Allow users to view their own stats
CREATE POLICY "Users can view their stats" ON user_stats
    FOR SELECT 
    USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL);

-- Allow inserting/updating stats
CREATE POLICY "Users can insert/update stats" ON user_stats
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- ACHIEVEMENTS TABLE POLICIES
-- Allow users to view their own achievements
CREATE POLICY "Users can view their achievements" ON achievements
    FOR SELECT 
    USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL);

-- Allow inserting achievements
CREATE POLICY "Users can insert achievements" ON achievements
    FOR INSERT 
    WITH CHECK (true);

-- BUSINESS DASHBOARDS TABLE POLICIES
-- Allow users to view their own business dashboard
CREATE POLICY "Users can view their business dashboard" ON business_dashboards
    FOR SELECT 
    USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL);

-- Allow inserting/updating business dashboards
CREATE POLICY "Users can insert/update business dashboard" ON business_dashboards
    FOR ALL 
    USING (auth.uid() = user_id::uuid OR auth.uid() IS NULL)
    WITH CHECK (auth.uid() = user_id::uuid OR auth.uid() IS NULL);

-- BOOKINGS TABLE POLICIES
-- Allow users to view their bookings (as customer)
CREATE POLICY "Users can view their bookings" ON bookings
    FOR SELECT 
    USING (auth.uid() = customer_id::uuid OR auth.uid() IS NULL);

-- Allow business owners to view bookings for their business
CREATE POLICY "Business owners can view their bookings" ON bookings
    FOR SELECT 
    USING (auth.uid() = business_id::uuid OR auth.uid() IS NULL);

-- Allow inserting bookings
CREATE POLICY "Users can insert bookings" ON bookings
    FOR INSERT 
    WITH CHECK (true);

-- 4. Grant necessary permissions to authenticated and anonymous users
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

GRANT ALL ON referrals TO authenticated;
GRANT ALL ON referrals TO anon;

GRANT ALL ON user_activities TO authenticated;
GRANT ALL ON user_activities TO anon;

GRANT ALL ON user_stats TO authenticated;
GRANT ALL ON user_stats TO anon;

GRANT ALL ON achievements TO authenticated;
GRANT ALL ON achievements TO anon;

GRANT ALL ON business_dashboards TO authenticated;
GRANT ALL ON business_dashboards TO anon;

GRANT ALL ON bookings TO authenticated;
GRANT ALL ON bookings TO anon;

-- 5. Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'referrals', 'user_activities', 'user_stats', 'achievements', 'business_dashboards', 'bookings')
ORDER BY tablename, policyname; 