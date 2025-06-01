import nodemailer from 'nodemailer'

interface RewardEmailData {
  userEmail: string
  userName: string
  rewardType: 'points' | 'credits' | 'pro_subscription' | 'referral_bonus' | 'achievement' | 'cashback' | 'discount'
  amount?: number
  description: string
  expiryDate?: string
  source?: string
  profileLink?: string
}

// Production-ready reward notification service
export async function sendRewardNotificationDirect(data: RewardEmailData) {
  try {
    const { userEmail, userName, rewardType, amount, description, expiryDate, source, profileLink } = data

    // Validate environment configuration
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP configuration missing')
    }

    // Create optimized transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    })

    // Generate dynamic content
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fastbookr.com'
    const finalProfileLink = profileLink || `${baseUrl}/profile`

    // Get reward configuration
    const rewardConfig = getRewardConfiguration(rewardType, amount)
    
    // Generate email content
    const emailContent = generateRewardEmailTemplate({
      userName,
      rewardType,
      amount,
      description,
      expiryDate,
      source,
      profileLink: finalProfileLink,
      ...rewardConfig
    })

    // Send reward notification email
    await transporter.sendMail({
      from: `"FastBookr Rewards" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `🎁 ${rewardConfig.rewardTitle} - FastBookr Rewards`,
      html: emailContent,
    })

    // Production logging (minimal)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Reward notification sent to ${userEmail} for ${rewardType}`)
    }

    return { success: true, message: 'Reward notification email sent successfully' }

  } catch (error) {
    // Production error handling
    if (process.env.NODE_ENV === 'production') {
      console.error('Reward email error:', error instanceof Error ? error.message : 'Unknown error')
    } else {
      console.error('Reward notification email error:', error)
    }
    throw new Error('Failed to send reward notification')
  }
}

// Helper function to get reward configuration
function getRewardConfiguration(rewardType: string, amount?: number) {
  const configs = {
    points: {
      rewardIcon: '⭐',
      rewardColor: '#f59e0b',
      rewardBg: '#fef3c7',
      rewardTitle: `+${amount} Points Earned!`,
      actionButton: 'View Points',
      tips: ['Use points to unlock exclusive discounts', 'Earn more points by completing bookings', 'Refer friends to earn bonus points']
    },
    credits: {
      rewardIcon: '💰',
      rewardColor: '#10b981',
      rewardBg: '#dcfce7',
      rewardTitle: `₹${amount} Credits Added!`,
      actionButton: 'View Wallet',
      tips: ['Credits can be used for any booking', 'Credits never expire in your wallet', 'Combine credits with other offers']
    },
    pro_subscription: {
      rewardIcon: '👑',
      rewardColor: '#8b5cf6',
      rewardBg: '#f3e8ff',
      rewardTitle: 'Pro Subscription Activated!',
      actionButton: 'Explore Pro Features',
      tips: ['Access premium business tools', 'Get priority customer support', 'Unlock advanced analytics']
    },
    referral_bonus: {
      rewardIcon: '🎉',
      rewardColor: '#ec4899',
      rewardBg: '#fce7f3',
      rewardTitle: 'Referral Bonus Unlocked!',
      actionButton: 'View Referrals',
      tips: ['Share your referral code for more rewards', 'Earn bonus for each successful referral', 'Help friends discover FastBookr']
    },
    achievement: {
      rewardIcon: '🏆',
      rewardColor: '#f59e0b',
      rewardBg: '#fef3c7',
      rewardTitle: 'Achievement Unlocked!',
      actionButton: 'View Achievements',
      tips: ['Complete more activities to unlock achievements', 'Each achievement comes with rewards', 'Share your achievements with friends']
    },
    cashback: {
      rewardIcon: '💸',
      rewardColor: '#06b6d4',
      rewardBg: '#cffafe',
      rewardTitle: `₹${amount} Cashback Received!`,
      actionButton: 'View Cashback',
      tips: ['Cashback is automatically added to your wallet', 'Use cashback for future bookings', 'Earn more cashback with every booking']
    },
    discount: {
      rewardIcon: '🏷️',
      rewardColor: '#ef4444',
      rewardBg: '#fee2e2',
      rewardTitle: `${amount}% Discount Unlocked!`,
      actionButton: 'Use Discount',
      tips: ['Apply discount during checkout', 'Cannot be combined with other discounts', 'Valid for limited time only']
    }
  }

  return configs[rewardType as keyof typeof configs] || configs.points
}

// Helper function to generate reward email template
interface RewardEmailTemplateData {
  userName: string
  rewardType: string
  amount?: number
  description: string
  expiryDate?: string
  source?: string
  profileLink: string
  rewardIcon: string
  rewardColor: string
  rewardBg: string
  rewardTitle: string
  actionButton: string
  tips: string[]
}

function generateRewardEmailTemplate(data: RewardEmailTemplateData): string {
  const { 
    userName, description, expiryDate, source, profileLink,
    rewardIcon, rewardColor, rewardBg, rewardTitle, actionButton, tips
  } = data

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${rewardColor} 0%, ${rewardColor}dd 100%); color: white; padding: 30px 20px; border-radius: 15px 15px 0 0; text-align: center; margin: -20px -20px 0 -20px;">
        <div style="font-size: 64px; margin-bottom: 15px;">${rewardIcon}</div>
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">FastBookr Rewards</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal; opacity: 0.95;">
          ${rewardTitle}
        </h2>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px 20px; background: white; margin: 0 -20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h3 style="color: #1f2937; font-size: 22px; margin: 0 0 10px 0;">
            Hi ${userName}! 👋
          </h3>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
            ${description}
          </p>
        </div>

        <!-- Reward Details -->
        <div style="background: ${rewardBg}; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border-left: 4px solid ${rewardColor};">
          <div style="font-size: 48px; margin-bottom: 15px;">${rewardIcon}</div>
          <h3 style="color: ${rewardColor}; margin: 0 0 10px 0; font-size: 24px;">${rewardTitle}</h3>
          <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.5;">
            ${description}
          </p>
          ${source ? `
            <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">
              <strong>Source:</strong> ${source}
            </p>
          ` : ''}
          ${expiryDate ? `
            <p style="color: #ef4444; margin: 15px 0 0 0; font-size: 14px; font-weight: bold;">
              ⏰ <strong>Expires:</strong> ${expiryDate}
            </p>
          ` : ''}
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${profileLink}" 
             style="display: inline-block; background: linear-gradient(135deg, ${rewardColor} 0%, ${rewardColor}dd 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px ${rewardColor}33;">
            ${actionButton}
          </a>
        </div>
        
        <!-- Tips -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #6b7280;">
          <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">💡 Pro Tips:</h4>
          <ul style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
            Keep earning rewards and enjoy exclusive benefits with FastBookr!
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
            Best regards,<br>
            <strong style="color: #1f2937;">The FastBookr Rewards Team</strong> 🎁
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 15px 15px; text-align: center; margin: 0 -20px -20px -20px;">
        <div style="color: #6b7280; font-size: 12px; line-height: 1.5;">
          📧 <strong>Email:</strong> hello@fastbookr.com<br>
          📱 <strong>Phone:</strong> +91 9098523694<br>
          🌐 <strong>Website:</strong> fastbookr.com
        </div>
      </div>
    </div>
  `
}

// Optimized helper functions for specific reward types
export async function sendPointsReward(userEmail: string, userName: string, points: number, source: string) {
  return sendRewardNotificationDirect({
    userEmail,
    userName,
    rewardType: 'points',
    amount: points,
    description: `Congratulations! You've earned ${points} points. Keep up the great work!`,
    source
  })
}

export async function sendCreditsReward(userEmail: string, userName: string, credits: number, source: string, expiryDate?: string) {
  return sendRewardNotificationDirect({
    userEmail,
    userName,
    rewardType: 'credits',
    amount: credits,
    description: `Great news! ₹${credits} has been added to your wallet. Use these credits for your next booking.`,
    source,
    expiryDate
  })
}

export async function sendProSubscriptionReward(userEmail: string, userName: string, duration: string, source: string) {
  return sendRewardNotificationDirect({
    userEmail,
    userName,
    rewardType: 'pro_subscription',
    description: `Your Pro subscription is now active! Enjoy ${duration} of premium features and exclusive benefits.`,
    source
  })
}

export async function sendReferralBonusReward(userEmail: string, userName: string, bonus: number, referredUserName: string) {
  return sendRewardNotificationDirect({
    userEmail,
    userName,
    rewardType: 'referral_bonus',
    amount: bonus,
    description: `Someone joined FastBookr using your referral code! ${referredUserName} is now part of the FastBookr community.`,
    source: 'Referral Program'
  })
}

export async function sendAchievementReward(userEmail: string, userName: string, achievementName: string, description: string) {
  return sendRewardNotificationDirect({
    userEmail,
    userName,
    rewardType: 'achievement',
    description: `${achievementName}: ${description}`,
    source: 'Achievement System'
  })
}

export async function sendCashbackReward(userEmail: string, userName: string, cashback: number, bookingDetails: string) {
  return sendRewardNotificationDirect({
    userEmail,
    userName,
    rewardType: 'cashback',
    amount: cashback,
    description: `Cashback from your recent booking: ${bookingDetails}`,
    source: 'Booking Cashback'
  })
}

export async function sendDiscountReward(userEmail: string, userName: string, discountPercent: number, description: string, expiryDate?: string) {
  return sendRewardNotificationDirect({
    userEmail,
    userName,
    rewardType: 'discount',
    amount: discountPercent,
    description,
    source: 'Special Offer',
    expiryDate
  })
} 