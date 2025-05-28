-- FOLLOW SYSTEM MIGRATION
-- This file creates the follow/unfollow functionality for the BookNow platform

-- 1. Create follows table to track user follows
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id) -- Prevent duplicate follows
);

-- 2. Add follower/following counts to users table (for performance)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 3. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);
CREATE INDEX IF NOT EXISTS idx_users_followers_count ON users(followers_count);
CREATE INDEX IF NOT EXISTS idx_users_user_type_business ON users(user_type) WHERE user_type = 'business';

-- 4. Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increase following count for follower
        UPDATE users 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        -- Increase followers count for the user being followed
        UPDATE users 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease following count for follower
        UPDATE users 
        SET following_count = following_count - 1 
        WHERE id = OLD.follower_id;
        
        -- Decrease followers count for the user being unfollowed
        UPDATE users 
        SET followers_count = followers_count - 1 
        WHERE id = OLD.following_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to automatically update counts
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON follows;
CREATE TRIGGER update_follower_counts_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- 6. Function to follow a user
CREATE OR REPLACE FUNCTION follow_user(
    follower_user_id UUID,
    target_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    follow_exists BOOLEAN;
    target_user_exists BOOLEAN;
BEGIN
    -- Check if target user exists
    SELECT EXISTS(SELECT 1 FROM users WHERE id = target_user_id) INTO target_user_exists;
    
    IF NOT target_user_exists THEN
        RAISE EXCEPTION 'Target user does not exist';
    END IF;
    
    -- Check if users are trying to follow themselves
    IF follower_user_id = target_user_id THEN
        RAISE EXCEPTION 'Users cannot follow themselves';
    END IF;
    
    -- Check if already following
    SELECT EXISTS(
        SELECT 1 FROM follows 
        WHERE follower_id = follower_user_id 
        AND following_id = target_user_id
    ) INTO follow_exists;
    
    IF follow_exists THEN
        RETURN FALSE; -- Already following
    END IF;
    
    -- Create follow relationship
    INSERT INTO follows (follower_id, following_id)
    VALUES (follower_user_id, target_user_id);
    
    -- Create activity for follower
    INSERT INTO user_activities (
        user_id,
        activity_type,
        description,
        reward_points,
        metadata
    ) VALUES (
        follower_user_id,
        'follow',
        'Started following a business user! 👥',
        5,
        jsonb_build_object(
            'target_user_id', target_user_id,
            'action', 'follow'
        )
    );
    
    -- Create activity for the followed user
    INSERT INTO user_activities (
        user_id,
        activity_type,
        description,
        reward_points,
        metadata
    ) VALUES (
        target_user_id,
        'new_follower',
        'Gained a new follower! 🎉',
        2,
        jsonb_build_object(
            'follower_user_id', follower_user_id,
            'action', 'new_follower'
        )
    );
    
    RETURN TRUE; -- Successfully followed
END;
$$ LANGUAGE plpgsql;

-- 7. Function to unfollow a user
CREATE OR REPLACE FUNCTION unfollow_user(
    follower_user_id UUID,
    target_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    follow_exists BOOLEAN;
BEGIN
    -- Check if follow relationship exists
    SELECT EXISTS(
        SELECT 1 FROM follows 
        WHERE follower_id = follower_user_id 
        AND following_id = target_user_id
    ) INTO follow_exists;
    
    IF NOT follow_exists THEN
        RETURN FALSE; -- Not following
    END IF;
    
    -- Remove follow relationship
    DELETE FROM follows 
    WHERE follower_id = follower_user_id 
    AND following_id = target_user_id;
    
    -- Create activity for unfollower
    INSERT INTO user_activities (
        user_id,
        activity_type,
        description,
        metadata
    ) VALUES (
        follower_user_id,
        'unfollow',
        'Unfollowed a business user',
        jsonb_build_object(
            'target_user_id', target_user_id,
            'action', 'unfollow'
        )
    );
    
    RETURN TRUE; -- Successfully unfollowed
END;
$$ LANGUAGE plpgsql;

-- 8. Function to search business users
CREATE OR REPLACE FUNCTION search_business_users(
    search_query TEXT DEFAULT '',
    current_user_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
) RETURNS TABLE(
    id UUID,
    full_name VARCHAR(255),
    business_name VARCHAR(255),
    business_category VARCHAR(255),
    business_description TEXT,
    location VARCHAR(255),
    profile_image_url TEXT,
    followers_count INTEGER,
    following_count INTEGER,
    is_following BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.full_name,
        u.business_name,
        u.business_category,
        u.business_description,
        u.location,
        u.profile_image_url,
        u.followers_count,
        u.following_count,
        CASE 
            WHEN current_user_id IS NULL THEN FALSE
            ELSE EXISTS(
                SELECT 1 FROM follows f 
                WHERE f.follower_id = current_user_id 
                AND f.following_id = u.id
            )
        END as is_following,
        u.created_at
    FROM users u
    WHERE u.user_type = 'business'
    AND (
        search_query = '' OR
        LOWER(u.full_name) LIKE LOWER('%' || search_query || '%') OR
        LOWER(u.business_name) LIKE LOWER('%' || search_query || '%') OR
        LOWER(u.business_category) LIKE LOWER('%' || search_query || '%') OR
        LOWER(u.location) LIKE LOWER('%' || search_query || '%')
    )
    ORDER BY 
        u.followers_count DESC,
        u.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Function to get user's followers
CREATE OR REPLACE FUNCTION get_user_followers(
    target_user_id UUID,
    current_user_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
) RETURNS TABLE(
    id UUID,
    full_name VARCHAR(255),
    business_name VARCHAR(255),
    user_type VARCHAR(20),
    profile_image_url TEXT,
    followers_count INTEGER,
    following_count INTEGER,
    is_following BOOLEAN,
    followed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.full_name,
        u.business_name,
        u.user_type,
        u.profile_image_url,
        u.followers_count,
        u.following_count,
        CASE 
            WHEN current_user_id IS NULL THEN FALSE
            ELSE EXISTS(
                SELECT 1 FROM follows f2 
                WHERE f2.follower_id = current_user_id 
                AND f2.following_id = u.id
            )
        END as is_following,
        f.created_at as followed_at
    FROM follows f
    JOIN users u ON u.id = f.follower_id
    WHERE f.following_id = target_user_id
    ORDER BY f.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 10. Function to get user's following
CREATE OR REPLACE FUNCTION get_user_following(
    target_user_id UUID,
    current_user_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
) RETURNS TABLE(
    id UUID,
    full_name VARCHAR(255),
    business_name VARCHAR(255),
    user_type VARCHAR(20),
    profile_image_url TEXT,
    followers_count INTEGER,
    following_count INTEGER,
    is_following BOOLEAN,
    followed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.full_name,
        u.business_name,
        u.user_type,
        u.profile_image_url,
        u.followers_count,
        u.following_count,
        CASE 
            WHEN current_user_id IS NULL THEN FALSE
            WHEN current_user_id = target_user_id THEN TRUE -- User is viewing their own following
            ELSE EXISTS(
                SELECT 1 FROM follows f2 
                WHERE f2.follower_id = current_user_id 
                AND f2.following_id = u.id
            )
        END as is_following,
        f.created_at as followed_at
    FROM follows f
    JOIN users u ON u.id = f.following_id
    WHERE f.follower_id = target_user_id
    ORDER BY f.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 11. Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following(
    follower_user_id UUID,
    target_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM follows 
        WHERE follower_id = follower_user_id 
        AND following_id = target_user_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- 12. Update existing follower counts for all users (initial calculation)
UPDATE users 
SET followers_count = (
    SELECT COUNT(*) FROM follows 
    WHERE following_id = users.id
),
following_count = (
    SELECT COUNT(*) FROM follows 
    WHERE follower_id = users.id
)
WHERE followers_count = 0 OR following_count = 0;

-- 13. Grant necessary permissions
GRANT ALL ON follows TO anon;
GRANT ALL ON follows TO authenticated;

-- 14. Create RLS policies for follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users can view all follow relationships
CREATE POLICY "Allow viewing all follows" ON follows
    FOR SELECT 
    USING (true);

-- Users can only create follows for themselves
CREATE POLICY "Users can follow others" ON follows
    FOR INSERT 
    WITH CHECK (auth.uid() = follower_id::uuid OR auth.uid() IS NULL);

-- Users can only delete their own follows
CREATE POLICY "Users can unfollow others" ON follows
    FOR DELETE 
    USING (auth.uid() = follower_id::uuid OR auth.uid() IS NULL); 