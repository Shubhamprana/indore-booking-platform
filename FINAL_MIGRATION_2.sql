-- FINAL MIGRATION 2: Create new tables for real data tracking
-- This adds the missing tables for activities, achievements, and stats

-- 1. Create user_activities table to track user actions
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'referral', 'achievement', 'share', 'profile_update', 'registration'
    description TEXT NOT NULL,
    reward_points INTEGER DEFAULT 0,
    reward_amount DECIMAL(10,2) DEFAULT 0.00,
    metadata JSONB, -- Additional data like platform shared on, achievement details, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create achievements table to track user achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL, -- 'early_bird', 'social_butterfly', 'referral_champion', etc.
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_awarded INTEGER DEFAULT 0,
    UNIQUE(user_id, achievement_type) -- Each user can earn each achievement only once
);

-- 3. Create user_stats table to store calculated statistics
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    total_credits_earned DECIMAL(10,2) DEFAULT 0.00,
    total_points INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    position_rank INTEGER,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_stats_rank ON user_stats(position_rank);

-- 5. Apply update trigger to user_stats table
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at 
    BEFORE UPDATE ON user_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Function to calculate user statistics
CREATE OR REPLACE FUNCTION calculate_user_stats(target_user_id UUID)
RETURNS void AS $$
DECLARE
    referral_count INTEGER;
    successful_referral_count INTEGER;
    total_credits DECIMAL(10,2);
    total_points INTEGER;
    achievement_count INTEGER;
    user_rank INTEGER;
BEGIN
    -- Calculate referrals
    SELECT COUNT(*) INTO referral_count
    FROM referrals 
    WHERE referrer_id = target_user_id;
    
    SELECT COUNT(*) INTO successful_referral_count
    FROM referrals 
    WHERE referrer_id = target_user_id AND status = 'completed';
    
    -- Calculate total credits
    SELECT COALESCE(SUM(reward_amount), 0) INTO total_credits
    FROM referrals 
    WHERE referrer_id = target_user_id AND status = 'completed';
    
    -- Calculate total points
    SELECT COALESCE(SUM(reward_points), 0) INTO total_points
    FROM user_activities 
    WHERE user_id = target_user_id;
    
    -- Calculate achievements
    SELECT COUNT(*) INTO achievement_count
    FROM achievements 
    WHERE user_id = target_user_id;
    
    -- Calculate rank (based on successful referrals)
    SELECT COUNT(*) + 1 INTO user_rank
    FROM user_stats 
    WHERE successful_referrals > successful_referral_count;
    
    -- Insert or update user stats
    INSERT INTO user_stats (
        user_id, 
        total_referrals, 
        successful_referrals, 
        total_credits_earned, 
        total_points, 
        achievements_count, 
        position_rank,
        last_calculated_at
    ) VALUES (
        target_user_id, 
        referral_count, 
        successful_referral_count, 
        total_credits, 
        total_points, 
        achievement_count, 
        user_rank,
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_referrals = referral_count,
        successful_referrals = successful_referral_count,
        total_credits_earned = total_credits,
        total_points = total_points,
        achievements_count = achievement_count,
        position_rank = user_rank,
        last_calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 7. Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(
    target_user_id UUID,
    achievement_type_param TEXT,
    title_param TEXT,
    description_param TEXT,
    points_param INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
    INSERT INTO achievements (user_id, achievement_type, title, description, points_awarded)
    VALUES (target_user_id, achievement_type_param, title_param, description_param, points_param)
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
    
    -- Add activity record
    INSERT INTO user_activities (user_id, activity_type, description, reward_points)
    VALUES (target_user_id, 'achievement', 'Unlocked "' || title_param || '" badge', points_param);
    
    -- Recalculate stats
    PERFORM calculate_user_stats(target_user_id);
END;
$$ LANGUAGE plpgsql;

-- 8. Function to process referral
CREATE OR REPLACE FUNCTION process_referral(
    referrer_id_param UUID,
    referred_user_id_param UUID,
    referral_code_param TEXT
)
RETURNS void AS $$
DECLARE
    referral_count INTEGER;
BEGIN
    -- Insert referral record
    INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status)
    VALUES (referrer_id_param, referred_user_id_param, referral_code_param, 'completed');
    
    -- Add activity for referrer
    INSERT INTO user_activities (user_id, activity_type, description, reward_amount)
    VALUES (referrer_id_param, 'referral', 'Friend joined using your code', 500.00);
    
    -- Add activity for referred user
    INSERT INTO user_activities (user_id, activity_type, description, reward_points)
    VALUES (referred_user_id_param, 'referral', 'Joined using referral code', 100);
    
    -- Check for achievements
    SELECT COUNT(*) INTO referral_count
    FROM referrals 
    WHERE referrer_id = referrer_id_param AND status = 'completed';
    
    -- Award achievements based on referral count
    IF referral_count = 1 THEN
        PERFORM award_achievement(referrer_id_param, 'first_referral', 'First Referral', 'Made your first successful referral', 50);
    ELSIF referral_count = 5 THEN
        PERFORM award_achievement(referrer_id_param, 'referral_starter', 'Referral Starter', 'Referred 5 friends', 100);
    ELSIF referral_count = 10 THEN
        PERFORM award_achievement(referrer_id_param, 'referral_champion', 'Referral Champion', 'Referred 10+ friends', 200);
    ELSIF referral_count = 25 THEN
        PERFORM award_achievement(referrer_id_param, 'launch_ambassador', 'Launch Ambassador', 'Referred 25+ friends', 500);
    END IF;
    
    -- Recalculate stats for both users
    PERFORM calculate_user_stats(referrer_id_param);
    PERFORM calculate_user_stats(referred_user_id_param);
END;
$$ LANGUAGE plpgsql;

-- 9. Initialize stats for existing users
INSERT INTO user_stats (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM user_stats)
ON CONFLICT (user_id) DO NOTHING; 