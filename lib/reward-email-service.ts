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

// Production-ready reward notification service with anti-spam measures
export async function sendRewardNotificationDirect(data: RewardEmailData) {
  try {
    const { userEmail, userName, rewardType, amount, description, expiryDate, source, profileLink } = data

    // Validate environment configuration
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP configuration missing')
    }

    // Create optimized transporter with anti-spam settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      // Anti-spam configurations
      secure: true,
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      }
    })

    // Generate dynamic content
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fastbookr.com'
    const finalProfileLink = profileLink || `${baseUrl}/profile`

    // Get reward configuration
    const rewardConfig = getRewardConfiguration(rewardType, amount)
    
    // Generate anti-spam email content
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

    // Improved email headers to avoid spam
    const emailOptions = {
      from: `"FastBookr Team" <${process.env.SMTP_EMAIL}>`, // More trustworthy sender name
      to: userEmail,
      subject: getAntiSpamSubject(rewardType, rewardConfig.rewardTitle, userName),
      html: emailContent,
      text: generatePlainTextVersion(data, rewardConfig), // Add plain text version
      // Enhanced email headers for better deliverability and rendering
      headers: {
        'X-Mailer': 'FastBookr Notification System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'List-Unsubscribe': `<${baseUrl}/unsubscribe>`,
        'MIME-Version': '1.0',
        'Content-Type': 'multipart/alternative'
      },
      // Enhanced email options for better rendering
      encoding: 'utf8',
      alternatives: [
        {
          contentType: 'text/html; charset=utf-8',
          content: emailContent
        }
      ],
      // Message ID for better deliverability
      messageId: `reward-${rewardType}-${Date.now()}@fastbookr.com`,
      // Delivery options
      envelope: {
        from: process.env.SMTP_EMAIL,
        to: userEmail
      }
    }

    // Send reward notification email
    await transporter.sendMail(emailOptions)

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

// Generate anti-spam subject lines
function getAntiSpamSubject(rewardType: string, rewardTitle: string, userName: string): string {
  // Avoid spam trigger words and excessive punctuation
  const subjects = {
    points: `Your FastBookr Points Update - ${userName}`,
    credits: `Account Credit Added - FastBookr`,
    pro_subscription: `Premium Access Activated - FastBookr`,
    referral_bonus: `Referral Reward Confirmation - FastBookr`,
    achievement: `New Achievement Unlocked - FastBookr`,
    cashback: `Cashback Processed - FastBookr`,
    discount: `Discount Available - FastBookr`
  }
  
  return subjects[rewardType as keyof typeof subjects] || `FastBookr Account Update - ${userName}`
}

// Generate plain text version to improve deliverability
function generatePlainTextVersion(data: RewardEmailData, rewardConfig: any): string {
  const { userName, description, source } = data
  
  return `
Hi ${userName},

${description}

${source ? `Source: ${source}` : ''}

Visit your FastBookr account to view your reward details and manage your account.

Best regards,
The FastBookr Team

---
This email was sent to you because you have an active FastBookr account.
If you no longer wish to receive these notifications, please visit your account settings.
  `.trim()
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

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FastBookr Rewards</title>
    <style type="text/css">
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content { padding: 20px !important; }
        }
    </style>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif;">
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; min-height: 100vh;">
        <tr>
            <td align="center" valign="top" style="padding: 20px;">
                
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, ${rewardColor} 0%, ${adjustColor(rewardColor, -20)} 100%); background-color: ${rewardColor}; padding: 40px 20px; text-align: center;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <!-- Icon -->
                                        <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px auto; display: table; text-align: center;">
                                            <div style="display: table-cell; vertical-align: middle; font-size: 40px;">${rewardIcon}</div>
                                        </div>
                                        <!-- Title -->
                                        <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 8px 0; text-align: center;">FastBookr Rewards</h1>
                                        <!-- Subtitle -->
                                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0; font-weight: 500;">${rewardTitle}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;" class="content">
                            
                            <!-- Greeting -->
                            <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">
                                Hi ${userName}! 👋
                            </h2>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                                ${description}
                            </p>

                            <!-- Reward Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="background: ${rewardBg}; border: 2px solid ${rewardColor}; border-radius: 12px; padding: 30px; text-align: center;">
                                        <!-- Large Icon -->
                                        <div style="font-size: 48px; margin-bottom: 15px; line-height: 1;">${rewardIcon}</div>
                                        <!-- Title -->
                                        <h3 style="color: ${rewardColor}; margin: 0 0 10px 0; font-size: 22px; font-weight: bold;">${rewardTitle}</h3>
                                        <!-- Description -->
                                        <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.5;">${description}</p>
                                        ${source ? `<p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px; font-style: italic;">Source: ${source}</p>` : ''}
                                        ${expiryDate ? `<div style="background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 6px; margin-top: 15px; font-size: 14px; font-weight: bold;">⏰ Expires: ${expiryDate}</div>` : ''}
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Action Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${profileLink}" style="display: inline-block; background: ${rewardColor}; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">${actionButton}</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Tips Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f9fafb; border-radius: 8px; border-left: 4px solid ${rewardColor}; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">💡 Quick Tips:</h4>
                                        <ul style="color: #4b5563; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                                            ${tips.map(tip => `<li style="margin-bottom: 8px;">${tip}</li>`).join('')}
                                        </ul>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing -->
                            <div style="text-align: center; margin: 30px 0 20px 0;">
                                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                                    Thank you for being a valued FastBookr member! 🙏
                                </p>
                                <p style="color: #374151; font-size: 16px; font-weight: bold; margin: 10px 0 0 0;">
                                    The FastBookr Team
                                </p>
                            </div>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">FastBookr</h4>
                            <p style="color: #6b7280; font-size: 12px; line-height: 1.4; margin: 0 0 10px 0;">
                                🌟 Multi-Service Booking Platform<br>
                                📧 hello@fastbookr.com | 📞 +91 9098523694
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                <a href="${profileLink}" style="color: ${rewardColor}; text-decoration: none;">Manage Account</a> | 
                                <a href="${profileLink.replace('/profile', '/unsubscribe')}" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`;
}

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const colorMap: {[key: string]: string} = {
    '#f59e0b': percent < 0 ? '#d97706' : '#fbbf24',
    '#10b981': percent < 0 ? '#059669' : '#34d399', 
    '#8b5cf6': percent < 0 ? '#7c3aed' : '#a78bfa',
    '#ec4899': percent < 0 ? '#db2777' : '#f472b6',
    '#06b6d4': percent < 0 ? '#0891b2' : '#22d3ee',
    '#ef4444': percent < 0 ? '#dc2626' : '#f87171'
  }
  return colorMap[color] || color
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