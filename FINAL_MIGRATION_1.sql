-- FINAL MIGRATION 1: Update existing tables and add missing ones
-- This migration works with your existing users and referrals tables

-- 1. Add missing columns to existing referrals table
ALTER TABLE referrals 
ADD COLUMN IF NOT EXISTS reward_amount DECIMAL(10,2) DEFAULT 500.00,
ADD COLUMN IF NOT EXISTS credited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing referrals table to match our expected structure
-- (Only if the columns don't exist)
DO $$ 
BEGIN
    -- Check if referred_user_id column exists, if not rename referred_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referrals' AND column_name='referred_user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referrals' AND column_name='referred_id') THEN
            ALTER TABLE referrals RENAME COLUMN referred_id TO referred_user_id;
        END IF;
    END IF;
END $$;

-- 2. Create business_dashboards table for business-specific data
CREATE TABLE IF NOT EXISTS business_dashboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_hours JSONB, -- Store opening hours
    services_offered JSONB, -- Array of services with pricing
    booking_settings JSONB, -- Booking preferences and rules
    payment_methods JSONB, -- Accepted payment methods
    staff_members JSONB, -- Staff information
    business_metrics JSONB, -- Revenue, bookings, etc.
    subscription_plan TEXT DEFAULT 'starter',
    plan_status TEXT DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create bookings table for future booking management
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    total_amount DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_dashboards_user_id ON business_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);

-- 5. Apply update triggers to new tables (reuse existing function)
DROP TRIGGER IF EXISTS update_referrals_updated_at ON referrals;
CREATE TRIGGER update_referrals_updated_at 
    BEFORE UPDATE ON referrals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_dashboards_updated_at ON business_dashboards;
CREATE TRIGGER update_business_dashboards_updated_at 
    BEFORE UPDATE ON business_dashboards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 