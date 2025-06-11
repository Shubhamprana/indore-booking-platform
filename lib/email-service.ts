import nodemailer from 'nodemailer'

interface WelcomeEmailData {
  userEmail: string
  userName: string
  userType: 'customer' | 'business'
  referralCode: string
  hasReferralReward: boolean
  businessBonus?: boolean
}

// Production-ready email service
export async function sendWelcomeEmailDirect(data: WelcomeEmailData) {
  try {
    const { userEmail, userName, userType, referralCode, hasReferralReward, businessBonus } = data

    // Validate environment configuration
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP configuration missing')
    }

    // Create optimized transporter with Gmail SSL (same config as welcome emails)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })

    // Generate dynamic content
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fastbookr.com'
    const profileLink = `${baseUrl}/profile`
    
    // Determine reward content
    const rewardContent = getRewardContent(userType, hasReferralReward, businessBonus)

    // Optimized email template
    const emailContent = generateEmailTemplate({
      userName,
      userType,
      referralCode,
      profileLink,
      rewardContent
    })

    // Send email
    await transporter.sendMail({
      from: `"FastBookr Team" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `🎉 Welcome to FastBookr, ${userName}!`,
      html: emailContent,
    })

    // Production logging (minimal)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Welcome email sent to ${userEmail}`)
    }

    return { success: true, message: 'Welcome email sent successfully' }

  } catch (error) {
    // Production error handling
    if (process.env.NODE_ENV === 'production') {
      console.error('Email service error:', error instanceof Error ? error.message : 'Unknown error')
    } else {
      console.error('Email service error:', error)
    }
    throw new Error('Failed to send welcome email')
  }
}

// Helper function to get reward content
function getRewardContent(userType: string, hasReferralReward: boolean, businessBonus?: boolean): string {
  if (userType === 'business' && businessBonus) {
    return `
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">🎉 Business Partner Welcome Bonus!</h3>
        <p style="margin: 0; color: #374151; font-size: 16px;">
          <strong>LIFETIME FREE Pro Subscription</strong><br>
          Your premium business features are now active for life! No monthly fees, ever.
        </p>
      </div>
    `
  }
  
  if (hasReferralReward) {
    return `
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
        <h3 style="margin: 0 0 10px 0; font-size: 20px;">🎁 Referral Bonus!</h3>
        <p style="margin: 0; font-size: 16px; opacity: 0.95;">
          <strong>₹25 Welcome Credits</strong><br>
          Thanks for joining through a friend's referral!
        </p>
      </div>
    `
  }
  
  return `
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
      <h3 style="margin: 0 0 10px 0; font-size: 20px;">🚀 Early Adopter Benefits!</h3>
      <p style="margin: 0; font-size: 16px; opacity: 0.95;">
        <strong>50% OFF First 10 Bookings</strong><br>
        Exclusive pre-launch member discount
      </p>
    </div>
  `
}

// Helper function to generate email template
interface EmailTemplateData {
  userName: string
  userType: string
  referralCode: string
  profileLink: string
  rewardContent: string
}

function generateEmailTemplate(data: EmailTemplateData): string {
  const { userName, userType, referralCode, profileLink, rewardContent } = data
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 15px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px 20px; border-radius: 15px 15px 0 0; text-align: center; margin: -20px -20px 0 -20px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to FastBookr!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your ${userType === 'business' ? 'Business' : 'Early Adopter'} Journey Begins</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 30px 20px; background: white; margin: 0 -20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h3 style="color: #1f2937; font-size: 22px; margin: 0 0 10px 0;">
            Hi ${userName}! 👋
          </h3>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
            Welcome to FastBookr! You're now part of an exclusive community revolutionizing the booking experience.
          </p>
        </div>

        ${rewardContent}
        
        <!-- Quick Actions -->
        <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
          <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">🚀 Get Started:</h4>
          
          <div style="margin-bottom: 15px;">
            <a href="${profileLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 10px;">
              📊 View Your Profile
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
            💡 <strong>Your Referral Code:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${referralCode}</code>
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
            Thank you for joining us! We're excited to revolutionize your booking experience.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
            Best regards,<br>
            <strong style="color: #1f2937;">The FastBookr Team</strong> 🚀
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