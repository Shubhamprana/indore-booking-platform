-- PERFORMANCE OPTIMIZATION PART 2 - Functions and Views
-- Run this AFTER creating the indexes separately

-- 1. OPTIMIZED FUNCTIONS FOR FASTER PERFORMANCE

-- Fast user lookup by email (case insensitive)
CREATE OR REPLACE FUNCTION get_user_by_email_fast(user_email TEXT)
RETURNS TABLE(
  id UUID,
  email VARCHAR(255),
  full_name VARCHAR(255),
  user_type VARCHAR(20),
  business_name VARCHAR(255),
  referral_code VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.user_type, u.business_name, u.referral_code
  FROM users u
  WHERE LOWER(u.email) = LOWER(user_email)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fast referral code lookup (case insensitive)
CREATE OR REPLACE FUNCTION get_user_by_referral_code_fast(ref_code TEXT)
RETURNS TABLE(
  id UUID,
  full_name VARCHAR(255),
  user_type VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.full_name, u.user_type
  FROM users u
  WHERE LOWER(u.referral_code) = LOWER(ref_code)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Lightweight stats check without recalculation
CREATE OR REPLACE FUNCTION get_user_stats_fast(target_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  total_referrals INTEGER,
  successful_referrals INTEGER,
  total_credits_earned DECIMAL(10,2),
  total_points INTEGER,
  achievements_count INTEGER,
  position_rank INTEGER,
  last_calculated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.user_id,
    us.total_referrals,
    us.successful_referrals,
    us.total_credits_earned,
    us.total_points,
    us.achievements_count,
    us.position_rank,
    us.last_calculated_at
  FROM user_stats us
  WHERE us.user_id = target_user_id;
  
  -- If no stats found, return defaults without calculation
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      target_user_id,
      0::INTEGER,
      0::INTEGER,
      0.00::DECIMAL(10,2),
      0::INTEGER,
      0::INTEGER,
      0::INTEGER,
      NOW()::TIMESTAMP WITH TIME ZONE;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fast activity insert without heavy calculations
CREATE OR REPLACE FUNCTION create_user_activity_fast(
  target_user_id UUID,
  activity_type_param TEXT,
  description_param TEXT,
  reward_points_param INTEGER DEFAULT 0,
  reward_amount_param DECIMAL(10,2) DEFAULT 0.00,
  metadata_param JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activities (
    user_id,
    activity_type,
    description,
    reward_points,
    reward_amount,
    metadata
  ) VALUES (
    target_user_id,
    activity_type_param,
    description_param,
    reward_points_param,
    reward_amount_param,
    metadata_param
  );
END;
$$ LANGUAGE plpgsql;

-- Optimized referral processing for better performance
CREATE OR REPLACE FUNCTION process_referral_fast(
  referrer_id_param UUID,
  referred_user_id_param UUID,
  referral_code_param TEXT
) RETURNS VOID AS $$
BEGIN
  -- Create referral record
  INSERT INTO referrals (
    referrer_id,
    referred_user_id,
    referral_code,
    status,
    reward_amount
  ) VALUES (
    referrer_id_param,
    referred_user_id_param,
    referral_code_param,
    'completed',
    500.00
  );
  
  -- Add activity for referrer (minimal data)
  INSERT INTO user_activities (
    user_id,
    activity_type,
    description,
    reward_amount,
    metadata
  ) VALUES (
    referrer_id_param,
    'referral',
    'Friend joined using your code! Earned ₹500 credit 💰',
    500.00,
    jsonb_build_object(
      'referral_code', referral_code_param,
      'referred_user_id', referred_user_id_param,
      'reward_type', 'credits'
    )
  );
  
  -- Add activity for referred user
  INSERT INTO user_activities (
    user_id,
    activity_type,
    description,
    reward_points,
    metadata
  ) VALUES (
    referred_user_id_param,
    'referral',
    'Joined using referral code! Welcome bonus applied 🎁',
    100,
    jsonb_build_object(
      'referral_code', referral_code_param,
      'referrer_id', referrer_id_param,
      'reward_type', 'welcome_bonus'
    )
  );
  
  -- Update stats asynchronously (don't wait for completion)
  PERFORM pg_notify('stats_update', json_build_object(
    'user_ids', ARRAY[referrer_id_param, referred_user_id_param]
  )::text);
END;
$$ LANGUAGE plpgsql;

-- 2. CREATE MATERIALIZED VIEW FOR FASTER DASHBOARD QUERIES
DROP MATERIALIZED VIEW IF EXISTS user_dashboard_summary;
CREATE MATERIALIZED VIEW user_dashboard_summary AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.user_type,
  u.business_name,
  u.referral_code,
  u.created_at,
  COALESCE(us.total_referrals, 0) as total_referrals,
  COALESCE(us.successful_referrals, 0) as successful_referrals,
  COALESCE(us.total_credits_earned, 0) as total_credits_earned,
  COALESCE(us.total_points, 0) as total_points,
  COALESCE(us.achievements_count, 0) as achievements_count,
  COALESCE(us.position_rank, 0) as position_rank
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id;

-- Create regular indexes on materialized view (not concurrent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dashboard_summary_id ON user_dashboard_summary (id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_summary_email ON user_dashboard_summary (email);

-- Function to refresh materialized view (call periodically)
CREATE OR REPLACE FUNCTION refresh_user_dashboard_summary()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_summary;
END;
$$ LANGUAGE plpgsql;

-- 3. OPTIMIZED BUSINESS FUNCTIONS

-- Fast business user check
CREATE OR REPLACE FUNCTION is_business_user_fast(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_type_result TEXT;
BEGIN
  SELECT u.user_type INTO user_type_result
  FROM users u 
  WHERE u.id = check_user_id;
  
  RETURN user_type_result = 'business';
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. PERFORMANCE MONITORING FUNCTIONS

-- Check query performance
CREATE OR REPLACE FUNCTION check_query_performance()
RETURNS TABLE(
  query_type TEXT,
  avg_time_ms NUMERIC,
  total_calls BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'User lookup by email' as query_type,
    0.0 as avg_time_ms,
    0::BIGINT as total_calls
  UNION ALL
  SELECT 
    'Stats retrieval' as query_type,
    0.0 as avg_time_ms,
    0::BIGINT as total_calls;
END;
$$ LANGUAGE plpgsql;

-- 5. CLEANUP AND MAINTENANCE

-- Remove old activities to keep table size manageable
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS VOID AS $$
BEGIN
  DELETE FROM user_activities 
  WHERE created_at < NOW() - INTERVAL '6 months'
  AND activity_type IN ('login', 'profile_view', 'page_visit');
END;
$$ LANGUAGE plpgsql;

-- Analyze tables for better query planning
ANALYZE users;
ANALYZE user_stats;
ANALYZE referrals;
ANALYZE user_activities;
ANALYZE business_dashboards;

-- Grant permissions
GRANT SELECT ON user_dashboard_summary TO anon;
GRANT SELECT ON user_dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email_fast(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_referral_code_fast(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_stats_fast(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_business_user_fast(UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_user_activity_fast(UUID, TEXT, TEXT, INTEGER, DECIMAL, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION process_referral_fast(UUID, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION refresh_user_dashboard_summary() TO postgres;
GRANT EXECUTE ON FUNCTION cleanup_old_activities() TO postgres;

-- Success message
SELECT 'Performance optimizations applied successfully! 🚀' as result; 