-- FIX BUSINESS FUNCTIONS - Missing Database Functions
-- Run this in Supabase SQL Editor to fix business registration errors

-- 1. Function to grant pro subscription to business users
CREATE OR REPLACE FUNCTION grant_pro_subscription(
    business_user_id UUID,
    months_to_add INTEGER,
    reason TEXT DEFAULT 'referral_reward'
) RETURNS void AS $$
DECLARE
    current_expires_at TIMESTAMP WITH TIME ZONE;
    new_expires_at TIMESTAMP WITH TIME ZONE;
    current_months INTEGER;
BEGIN
    -- Get current subscription data
    SELECT pro_expires_at, pro_subscription_months
    INTO current_expires_at, current_months
    FROM business_dashboards
    WHERE user_id = business_user_id;
    
    -- If no dashboard exists, create one
    IF NOT FOUND THEN
        INSERT INTO business_dashboards (
            user_id,
            subscription_plan,
            plan_status,
            pro_subscription_months,
            pro_expires_at,
            pro_features_enabled,
            referral_pro_months_earned,
            initial_pro_months_given
        ) VALUES (
            business_user_id,
            'pro',
            'active',
            months_to_add,
            NOW() + (months_to_add || ' months')::interval,
            true,
            CASE WHEN reason = 'referral_reward' THEN months_to_add ELSE 0 END,
            CASE WHEN reason = 'initial_bonus' THEN true ELSE false END
        );
        
        -- Log the grant
        INSERT INTO user_activities (
            user_id,
            activity_type,
            description,
            reward_points,
            metadata
        ) VALUES (
            business_user_id,
            'pro_subscription_granted',
            CASE 
                WHEN reason = 'initial_bonus' THEN 'Welcome bonus: ' || months_to_add || ' months pro subscription! 🎉'
                WHEN reason = 'referral_reward' THEN 'Referral reward: ' || months_to_add || ' month pro subscription! 🏆'
                ELSE 'Pro subscription granted: ' || months_to_add || ' months'
            END,
            months_to_add * 100, -- 100 points per month
            jsonb_build_object(
                'reason', reason,
                'months_added', months_to_add,
                'grant_type', 'pro_subscription'
            )
        );
        
        RETURN;
    END IF;
    
    -- Calculate new expiry date
    IF current_expires_at IS NULL OR current_expires_at < NOW() THEN
        -- Subscription expired or never existed, start from now
        new_expires_at := NOW() + (months_to_add || ' months')::interval;
    ELSE
        -- Extend existing subscription
        new_expires_at := current_expires_at + (months_to_add || ' months')::interval;
    END IF;
    
    -- Update the dashboard
    UPDATE business_dashboards SET
        pro_subscription_months = COALESCE(current_months, 0) + months_to_add,
        pro_expires_at = new_expires_at,
        pro_features_enabled = true,
        plan_status = 'active',
        subscription_plan = 'pro',
        referral_pro_months_earned = CASE 
            WHEN reason = 'referral_reward' THEN COALESCE(referral_pro_months_earned, 0) + months_to_add
            ELSE COALESCE(referral_pro_months_earned, 0)
        END,
        initial_pro_months_given = CASE 
            WHEN reason = 'initial_bonus' THEN true
            ELSE COALESCE(initial_pro_months_given, false)
        END,
        updated_at = NOW()
    WHERE user_id = business_user_id;
    
    -- Log the activity
    INSERT INTO user_activities (
        user_id,
        activity_type,
        description,
        reward_points,
        metadata
    ) VALUES (
        business_user_id,
        'pro_subscription_granted',
        CASE 
            WHEN reason = 'initial_bonus' THEN 'Welcome bonus: ' || months_to_add || ' months pro subscription! 🎉'
            WHEN reason = 'referral_reward' THEN 'Referral reward: ' || months_to_add || ' month pro subscription! 🏆'
            ELSE 'Pro subscription granted: ' || months_to_add || ' months'
        END,
        months_to_add * 100, -- 100 points per month
        jsonb_build_object(
            'reason', reason,
            'months_added', months_to_add,
            'grant_type', 'pro_subscription',
            'new_expires_at', new_expires_at
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Function to grant initial business bonus (3 months pro)
CREATE OR REPLACE FUNCTION grant_initial_business_bonus(business_user_id UUID)
RETURNS void AS $$
DECLARE
    already_given BOOLEAN;
    user_type_check TEXT;
BEGIN
    -- Verify user is a business user
    SELECT user_type INTO user_type_check
    FROM users 
    WHERE id = business_user_id;
    
    IF user_type_check != 'business' THEN
        RAISE EXCEPTION 'User % is not a business user', business_user_id;
    END IF;
    
    -- Check if already given
    SELECT initial_pro_months_given INTO already_given
    FROM business_dashboards 
    WHERE user_id = business_user_id;
    
    -- If dashboard doesn't exist or bonus not given yet
    IF already_given IS NULL OR already_given = false THEN
        -- Grant 3 months pro subscription
        PERFORM grant_pro_subscription(
            business_user_id,
            3,
            'initial_bonus'
        );
        
        -- Ensure it's marked as given (grant_pro_subscription should handle this, but double-check)
        INSERT INTO business_dashboards (
            user_id,
            initial_pro_months_given,
            subscription_plan,
            plan_status,
            pro_features_enabled
        ) VALUES (
            business_user_id,
            true,
            'pro',
            'active',
            true
        ) ON CONFLICT (user_id) DO UPDATE SET
            initial_pro_months_given = true,
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to check if user is business (if not exists from performance optimization)
CREATE OR REPLACE FUNCTION is_business_user(user_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
    user_type_result TEXT;
BEGIN
    SELECT user_type INTO user_type_result
    FROM users 
    WHERE id = user_id;
    
    RETURN user_type_result = 'business';
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Function to process business referrals
CREATE OR REPLACE FUNCTION process_business_referral(
    referrer_id_param UUID,
    referred_user_id_param UUID,
    referral_code_param TEXT
) RETURNS void AS $$
DECLARE
    referrer_is_business BOOLEAN;
    referred_is_business BOOLEAN;
BEGIN
    -- Check user types
    SELECT is_business_user(referrer_id_param) INTO referrer_is_business;
    SELECT is_business_user(referred_user_id_param) INTO referred_is_business;
    
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
        CASE 
            WHEN referrer_is_business AND referred_is_business THEN 0 -- No money, will get pro subscription
            ELSE 500.00 -- Regular referral reward
        END
    );
    
    -- Process rewards based on user types
    IF referrer_is_business AND referred_is_business THEN
        -- Business referring business: Referrer gets 1 month pro
        PERFORM grant_pro_subscription(
            referrer_id_param, 
            1, 
            'referral_reward'
        );
        
        -- Add activity for referred business (they get initial 3 months separately)
        INSERT INTO user_activities (
            user_id,
            activity_type,
            description,
            reward_points,
            metadata
        ) VALUES (
            referred_user_id_param,
            'business_referral_used',
            'Joined using a business referral code! 🏢',
            0,
            jsonb_build_object(
                'referral_code', referral_code_param,
                'referrer_id', referrer_id_param,
                'reward_type', 'referral_used'
            )
        );
        
    ELSE
        -- Regular referral system for non-business users
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
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Create business subscription status view (if not exists)
CREATE OR REPLACE VIEW business_subscription_status AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.business_name,
    u.email,
    COALESCE(bd.subscription_plan, 'free') as subscription_plan,
    COALESCE(bd.plan_status, 'inactive') as plan_status,
    COALESCE(bd.pro_subscription_months, 0) as pro_subscription_months,
    bd.pro_expires_at,
    COALESCE(bd.pro_features_enabled, false) as pro_features_enabled,
    COALESCE(bd.referral_pro_months_earned, 0) as referral_pro_months_earned,
    COALESCE(bd.initial_pro_months_given, false) as initial_pro_months_given,
    CASE 
        WHEN bd.pro_expires_at IS NULL THEN false
        WHEN bd.pro_expires_at > NOW() THEN true
        ELSE false
    END as is_pro_active,
    CASE 
        WHEN bd.pro_expires_at IS NULL THEN 0
        WHEN bd.pro_expires_at > NOW() THEN EXTRACT(days FROM (bd.pro_expires_at - NOW()))::INTEGER
        ELSE 0
    END as days_remaining
FROM users u
LEFT JOIN business_dashboards bd ON u.id = bd.user_id
WHERE u.user_type = 'business';

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION grant_pro_subscription(UUID, INTEGER, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION grant_pro_subscription(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION grant_initial_business_bonus(UUID) TO anon;
GRANT EXECUTE ON FUNCTION grant_initial_business_bonus(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_business_user(UUID) TO anon;
GRANT EXECUTE ON FUNCTION is_business_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION process_business_referral(UUID, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION process_business_referral(UUID, UUID, TEXT) TO authenticated;
GRANT SELECT ON business_subscription_status TO anon;
GRANT SELECT ON business_subscription_status TO authenticated;

-- Success message
SELECT 'Business functions fixed successfully! 🚀' as result; 