-- Create process_referral function
CREATE OR REPLACE FUNCTION process_referral(
  referrer_id_param UUID,
  referred_user_id_param UUID,
  referral_code_param TEXT
) RETURNS void AS $$
BEGIN
  -- Create referral record
  INSERT INTO referrals (
    referrer_id,
    referred_user_id,
    referral_code,
    reward_points,
    status
  ) VALUES (
    referrer_id_param,
    referred_user_id_param,
    referral_code_param,
    500,
    'active'
  );
  
  -- Add activity for referrer
  INSERT INTO user_activities (
    user_id,
    activity_type,
    description,
    reward_points,
    metadata
  ) VALUES (
    referrer_id_param,
    'referral',
    'Someone joined using your referral code',
    100,
    jsonb_build_object(
      'referral_code', referral_code_param,
      'reward_amount', 500
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
    'Used a referral code to join',
    100,
    jsonb_build_object(
      'referral_code', referral_code_param
    )
  );
  
  -- Update user stats for both users
  PERFORM calculate_user_stats(referrer_id_param);
  PERFORM calculate_user_stats(referred_user_id_param);
END;
$$ LANGUAGE plpgsql;

-- Create calculate_user_stats function
CREATE OR REPLACE FUNCTION calculate_user_stats(target_user_id UUID) RETURNS void AS $$
DECLARE
  total_refs INTEGER;
  successful_refs INTEGER;
  total_pts INTEGER;
  achievement_count INTEGER;
  credit_amount INTEGER;
BEGIN
  -- Count referrals
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO 
    total_refs,
    successful_refs
  FROM referrals
  WHERE referrer_id = target_user_id;
  
  -- Sum points from activities
  SELECT COALESCE(SUM(reward_points), 0)
  INTO total_pts
  FROM user_activities
  WHERE user_id = target_user_id;
  
  -- Count achievements
  SELECT COUNT(*)
  INTO achievement_count
  FROM achievements
  WHERE user_id = target_user_id;
  
  -- Calculate credits (₹500 per successful referral)
  credit_amount := successful_refs * 500;
  
  -- Update or insert stats
  INSERT INTO user_stats (
    user_id,
    total_referrals,
    successful_referrals,
    total_credits_earned,
    total_points,
    achievements_count,
    last_calculated_at
  ) VALUES (
    target_user_id,
    total_refs,
    successful_refs,
    credit_amount,
    total_pts,
    achievement_count,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_referrals = EXCLUDED.total_referrals,
    successful_referrals = EXCLUDED.successful_referrals,
    total_credits_earned = EXCLUDED.total_credits_earned,
    total_points = EXCLUDED.total_points,
    achievements_count = EXCLUDED.achievements_count,
    last_calculated_at = EXCLUDED.last_calculated_at;
END;
$$ LANGUAGE plpgsql; 