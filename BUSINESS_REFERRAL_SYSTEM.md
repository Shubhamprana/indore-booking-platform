# Business Referral Reward System

This document outlines the implementation of the business referral reward system that provides pro subscription benefits to business users.

## Overview

The system implements two distinct reward types:
1. **Business users get 3 months FREE pro subscription** just for registering
2. **Business users get +1 month pro subscription** for each business they refer

## Key Features

### 🎯 **Automatic Benefits**
- **New business registration**: Automatically receives 3 months free pro subscription
- **Business-to-business referrals**: Referrer gets 1 month pro extension
- **Seamless integration**: Works alongside existing customer referral system

### 🔧 **Technical Implementation**

#### Database Changes
- Added pro subscription columns to `business_dashboards` table
- New functions: `grant_pro_subscription`, `process_business_referral`
- View: `business_subscription_status` for easy querying

#### TypeScript Integration
- New module: `lib/business-subscription.ts`
- Updated registration flow in `lib/auth.ts`
- Business referral benefits component

## Reward Rules

### For Business Users

| Action | Reward | Details |
|--------|--------|---------|
| **Register as Business** | 3 months pro free | Automatic, no referral needed |
| **Refer another Business** | +1 month pro free | Per successful business referral |
| **Use referral (business)** | 3 months pro free | Same as registration bonus |

### For Customer Users
- **Existing system unchanged**: Still get ₹500 credits per referral
- **Mixed referrals work**: Customer can refer business, business can refer customer

## Database Schema

### Enhanced `business_dashboards` Table
```sql
ALTER TABLE business_dashboards 
ADD COLUMN pro_subscription_months INTEGER DEFAULT 0,
ADD COLUMN pro_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN pro_features_enabled BOOLEAN DEFAULT false,
ADD COLUMN referral_pro_months_earned INTEGER DEFAULT 0,
ADD COLUMN initial_pro_months_given BOOLEAN DEFAULT false;
```

### Key Functions

#### `grant_pro_subscription(user_id, months, reason)`
- Grants pro subscription months to business users
- Handles expiry date calculations
- Creates activity records

#### `process_business_referral(referrer_id, referred_id, code)`
- Processes business-to-business referrals
- Grants 1 month pro to referrer
- Falls back to regular system for mixed referrals

#### `grant_initial_business_bonus(user_id)`
- Gives 3 months pro to new business users
- Prevents duplicate bonuses
- Called during registration

## Usage Examples

### Registration Flow
```typescript
// During business user registration
if (registerData.userType === "business") {
  await initializeBusinessDashboard(userProfile.id)
  await grantInitialBusinessBonus(userProfile.id)
}
```

### Referral Processing
```typescript
// Check user types and process accordingly
const referrerIsBusiness = await isBusinessUser(referrer.id)
const referredIsBusiness = registerData.userType === "business"

if (referrerIsBusiness && referredIsBusiness) {
  await processBusinessReferral(referrer.id, userProfile.id, referralCode)
} else {
  await processReferral(referrer.id, userProfile.id, referralCode)
}
```

## Pro Features Included

- ✅ Unlimited bookings per month
- ✅ Advanced analytics & insights  
- ✅ 24/7 priority customer support
- ✅ Custom branding & themes
- ✅ API access for integrations
- ✅ Advanced staff management
- ✅ Automated marketing campaigns
- ✅ Multi-location management
- ✅ Advanced payment processing
- ✅ Advanced customer database

## User Interface

### Registration Page
- Updated business option with clear pro benefits
- Shows "3 months FREE pro subscription" prominently
- Explains referral rewards for businesses

### Welcome Page  
- `BusinessReferralBenefits` component for business users
- Shows both registration bonus and referral rewards
- Pro features preview

### Dashboard Integration
- Subscription status display
- Days remaining counter
- Referral progress tracking

## API Functions

### Frontend Functions (`lib/business-subscription.ts`)

```typescript
// Grant pro subscription
await grantProSubscription(userId, months, reason)

// Check subscription status
const status = await getBusinessSubscriptionStatus(userId)

// Check if user has active pro
const hasProActive = await hasActivePro(userId)

// Process business referral
await processBusinessReferral(referrerId, referredId, code)
```

### Database Functions (SQL)

```sql
-- Grant pro subscription
SELECT grant_pro_subscription(user_id, months_to_add, reason);

-- Process business referral
SELECT process_business_referral(referrer_id, referred_id, referral_code);

-- Grant initial bonus
SELECT grant_initial_business_bonus(user_id);
```

## Testing

### Test Scenarios

1. **Business Registration**
   - Register as business user
   - Verify 3 months pro granted
   - Check dashboard shows pro status

2. **Business Referral**
   - Business A refers Business B
   - Verify A gets +1 month pro
   - Verify B gets initial 3 months pro

3. **Mixed Referrals**
   - Business refers customer → Business gets ₹500 credits
   - Customer refers business → Customer gets ₹500 credits

4. **Edge Cases**
   - Multiple referrals from same business
   - Expired pro subscription extensions
   - Invalid referral codes

### SQL Testing Queries

```sql
-- Check business subscription status
SELECT * FROM business_subscription_status WHERE user_id = 'user-id';

-- Check recent activities
SELECT * FROM user_activities 
WHERE user_id = 'user-id' 
AND activity_type IN ('pro_subscription_reward', 'business_referral_used')
ORDER BY created_at DESC;

-- Check referral records
SELECT * FROM referrals 
WHERE referrer_id = 'user-id' OR referred_user_id = 'user-id'
ORDER BY created_at DESC;
```

## Migration Guide

### Apply Database Changes
1. Run `BUSINESS_REFERRAL_REWARDS.sql` in Supabase SQL Editor
2. Verify new columns and functions created
3. Test with sample data

### Update Existing Business Users
```sql
-- Grant initial bonus to existing business users
SELECT grant_initial_business_bonus(id) 
FROM users 
WHERE user_type = 'business' 
AND id NOT IN (
  SELECT user_id FROM business_dashboards 
  WHERE initial_pro_months_given = true
);
```

## Monitoring & Analytics

### Key Metrics to Track
- Business registration conversions
- Business-to-business referral rate
- Pro subscription retention
- Feature usage by pro users

### Dashboard Queries
```sql
-- Business referral statistics
SELECT 
  COUNT(*) as total_business_referrals,
  SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as last_30_days
FROM referrals r
JOIN users u1 ON r.referrer_id = u1.id
JOIN users u2 ON r.referred_user_id = u2.id
WHERE u1.user_type = 'business' AND u2.user_type = 'business';

-- Pro subscription status overview
SELECT 
  COUNT(*) as total_businesses,
  COUNT(CASE WHEN is_pro_active THEN 1 END) as active_pro_users,
  AVG(pro_subscription_months) as avg_pro_months
FROM business_subscription_status;
```

## Troubleshooting

### Common Issues

1. **Pro subscription not granted**
   - Check if business dashboard exists
   - Verify user_type is 'business'
   - Check activity logs for errors

2. **Referral not processed**
   - Verify both users exist
   - Check referral code validity
   - Ensure no duplicate referrals

3. **Wrong reward type given**
   - Check user types in referral processing
   - Verify function calls are correct

### Debug Queries
```sql
-- Check user type
SELECT id, full_name, user_type FROM users WHERE email = 'user@example.com';

-- Check business dashboard
SELECT * FROM business_dashboards WHERE user_id = 'user-id';

-- Check recent activities
SELECT * FROM user_activities 
WHERE user_id = 'user-id' 
ORDER BY created_at DESC LIMIT 10;
```

## Future Enhancements

### Planned Features
- [ ] Business tier upgrades (Pro → Enterprise)
- [ ] Volume referral bonuses (10+ business referrals)
- [ ] Partner program for agencies
- [ ] Subscription management dashboard
- [ ] Automated renewal reminders

### Scalability Considerations
- Index optimization for large user bases
- Batch processing for subscription renewals
- Caching for subscription status checks
- Integration with payment processors

## Support

For implementation questions or issues:
- Check troubleshooting section first
- Review SQL function definitions
- Test with sample data in development
- Monitor activity logs for errors

## Changelog

### v1.0 (Current)
- ✅ Initial implementation
- ✅ 3 months registration bonus
- ✅ 1 month per business referral  
- ✅ Mixed referral system support
- ✅ Pro features access
- ✅ UI components and documentation 