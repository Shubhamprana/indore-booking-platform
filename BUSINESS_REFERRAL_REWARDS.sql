-- BUSINESS REFERRAL REWARDS SYSTEM
-- Implements pro subscription rewards for business users

-- 1. Add pro subscription columns to business_dashboards table
ALTER TABLE business_dashboards 
ADD COLUMN IF NOT EXISTS pro_subscription_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pro_features_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_pro_months_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_pro_months_given BOOLEAN DEFAULT false;

-- 2. Create function to grant pro subscription months
CREATE OR REPLACE FUNCTION grant_pro_subscription(
    business_user_id UUID,
    months_to_add INTEGER,
    reason TEXT DEFAULT 'referral_reward'
) RETURNS void AS $$
DECLARE
    current_expires_at TIMESTAMP WITH TIME ZONE;
    new_expires_at TIMESTAMP WITH TIME ZONE;
    dashboard_exists BOOLEAN;
BEGIN
    -- Check if business dashboard exists
    SELECT EXISTS(
        SELECT 1 FROM business_dashboards WHERE user_id = business_user_id
    ) INTO dashboard_exists;
    
    -- Create business dashboard if it doesn't exist
    IF NOT dashboard_exists THEN
        INSERT INTO business_dashboards (
            user_id, 
            subscription_plan, 
            plan_status,
            pro_subscription_months,
            pro_features_enabled
        ) VALUES (
            business_user_id, 
            'pro', 
            'active',
            months_to_add,
            true
        );
        
        -- Set expiry date
        new_expires_at := NOW() + INTERVAL '1 month' * months_to_add;
        
        UPDATE business_dashboards 
        SET pro_expires_at = new_expires_at
        WHERE user_id = business_user_id;
    ELSE
        -- Get current expiry date
        SELECT pro_expires_at INTO current_expires_at
        FROM business_dashboards 
        WHERE user_id = business_user_id;
        
        -- Calculate new expiry date
        IF current_expires_at IS NULL OR current_expires_at < NOW() THEN
            -- No active subscription, start from now
            new_expires_at := NOW() + INTERVAL '1 month' * months_to_add;
        ELSE
            -- Extend existing subscription
            new_expires_at := current_expires_at + INTERVAL '1 month' * months_to_add;
        END IF;
        
        -- Update subscription details
        UPDATE business_dashboards 
        SET 
            pro_subscription_months = pro_subscription_months + months_to_add,
            pro_expires_at = new_expires_at,
            pro_features_enabled = true,
            subscription_plan = 'pro',
            plan_status = 'active',
            referral_pro_months_earned = CASE 
                WHEN reason = 'referral_reward' THEN referral_pro_months_earned + months_to_add
                ELSE referral_pro_months_earned
            END
        WHERE user_id = business_user_id;
    END IF;
    
    -- Add activity record
    INSERT INTO user_activities (
        user_id, 
        activity_type, 
        description, 
        reward_amount,
        metadata
    ) VALUES (
        business_user_id,
        'pro_subscription_reward',
        CASE 
            WHEN reason = 'referral_reward' THEN 'Earned ' || months_to_add || ' month(s) pro subscription for referring a business! 🚀'
            WHEN reason = 'initial_bonus' THEN 'Welcome bonus: ' || months_to_add || ' month(s) free pro subscription! 🎉'
            ELSE 'Received ' || months_to_add || ' month(s) pro subscription'
        END,
        0,
        jsonb_build_object(
            'months_added', months_to_add,
            'reason', reason,
            'expires_at', new_expires_at,
            'reward_type', 'pro_subscription'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Create function to check if user is a business
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
$$ LANGUAGE plpgsql;

-- 4. Updated process_referral function for business rewards
CREATE OR REPLACE FUNCTION process_business_referral(
    referrer_id_param UUID,
    referred_user_id_param UUID,
    referral_code_param TEXT
) RETURNS void AS $$
DECLARE
    referrer_is_business BOOLEAN;
    referred_is_business BOOLEAN;
    referral_count INTEGER;
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
    
    -- Update user stats for both users
    PERFORM calculate_user_stats(referrer_id_param);
    PERFORM calculate_user_stats(referred_user_id_param);
END;
$$ LANGUAGE plpgsql;

-- 5. Function to grant initial business pro subscription
CREATE OR REPLACE FUNCTION grant_initial_business_bonus(business_user_id UUID)
RETURNS void AS $$
DECLARE
    already_given BOOLEAN;
BEGIN
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
        
        -- Mark as given
        UPDATE business_dashboards 
        SET initial_pro_months_given = true
        WHERE user_id = business_user_id;
        
        -- If dashboard didn't exist, the above won't update, so ensure it's marked
        INSERT INTO business_dashboards (
            user_id,
            initial_pro_months_given
        ) VALUES (
            business_user_id,
            true
        ) ON CONFLICT (user_id) DO UPDATE SET
            initial_pro_months_given = true;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Create view for business subscription status
CREATE OR REPLACE VIEW business_subscription_status AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.business_name,
    u.email,
    bd.subscription_plan,
    bd.plan_status,
    bd.pro_subscription_months,
    bd.pro_expires_at,
    bd.pro_features_enabled,
    bd.referral_pro_months_earned,
    bd.initial_pro_months_given,
    CASE 
        WHEN bd.pro_expires_at IS NULL THEN false
        WHEN bd.pro_expires_at > NOW() THEN true
        ELSE false
    END as is_pro_active,
    CASE 
        WHEN bd.pro_expires_at IS NULL THEN 0
        WHEN bd.pro_expires_at > NOW() THEN EXTRACT(days FROM (bd.pro_expires_at - NOW()))
        ELSE 0
    END as days_remaining
FROM users u
LEFT JOIN business_dashboards bd ON u.id = bd.user_id
WHERE u.user_type = 'business';

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_dashboards_pro_expires ON business_dashboards(pro_expires_at);
CREATE INDEX IF NOT EXISTS idx_business_dashboards_pro_enabled ON business_dashboards(pro_features_enabled);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- 8. Grant permissions
GRANT SELECT ON business_subscription_status TO anon;
GRANT SELECT ON business_subscription_status TO authenticated; 