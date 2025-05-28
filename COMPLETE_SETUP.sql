-- BookNow Complete Database Setup
-- This file contains all necessary tables, policies, and configurations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    user_type VARCHAR(20) CHECK (user_type IN ('customer', 'business')) NOT NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    service_interests TEXT[],
    business_name VARCHAR(255),
    business_category VARCHAR(255),
    business_description TEXT,
    current_booking_method VARCHAR(255),
    launch_interest INTEGER DEFAULT 5,
    marketing_consent BOOLEAN DEFAULT false,
    whatsapp_updates BOOLEAN DEFAULT false,
    early_access_interest BOOLEAN DEFAULT false,
    share_on_social BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    total_credits_earned DECIMAL(10,2) DEFAULT 0.00,
    total_points INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    position_rank INTEGER,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    reward_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    reward_points INTEGER DEFAULT 0,
    reward_amount DECIMAL(10,2) DEFAULT 0.00,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    points_awarded INTEGER DEFAULT 0,
    icon VARCHAR(50),
    progress INTEGER DEFAULT 100,
    target INTEGER DEFAULT 100,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);

-- Update trigger for users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Disabled for development - Enable in production)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;

-- Grant permissions for anonymous users (for registration)
GRANT ALL ON users TO anon;
GRANT ALL ON user_stats TO anon;
GRANT ALL ON referrals TO anon;
GRANT ALL ON user_activities TO anon;
GRANT ALL ON achievements TO anon;

-- Grant permissions for authenticated users
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_stats TO authenticated;
GRANT ALL ON referrals TO authenticated;
GRANT ALL ON user_activities TO authenticated;
GRANT ALL ON achievements TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Sample data for testing (optional)
-- Uncomment the following lines if you want sample data

/*
INSERT INTO users (email, full_name, phone, location, user_type, referral_code) VALUES
('john@example.com', 'John Doe', '+91 9876543210', 'Mumbai, India', 'customer', 'BNJOHN01'),
('jane@example.com', 'Jane Smith', '+91 9876543211', 'Delhi, India', 'business', 'BNJANE02'),
('bob@example.com', 'Bob Wilson', '+91 9876543212', 'Bangalore, India', 'customer', 'BNBOB003')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_stats (user_id, total_referrals, total_credits_earned, total_points) 
SELECT id, 0, 0.00, 0 FROM users 
ON CONFLICT (user_id) DO NOTHING;
*/

-- Verification queries
-- Run these to verify the setup worked correctly

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_stats', 'referrals', 'user_activities', 'achievements');

-- Check if indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Check table row counts
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 
    'user_stats' as table_name, COUNT(*) as row_count FROM user_stats
UNION ALL
SELECT 
    'referrals' as table_name, COUNT(*) as row_count FROM referrals
UNION ALL
SELECT 
    'user_activities' as table_name, COUNT(*) as row_count FROM user_activities
UNION ALL
SELECT 
    'achievements' as table_name, COUNT(*) as row_count FROM achievements;