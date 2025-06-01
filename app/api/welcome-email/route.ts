import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface WelcomeEmailData {
  userEmail: string
  userName: string
  userType: 'customer' | 'business'
  referralCode: string
  hasReferralReward: boolean
  businessBonus?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: WelcomeEmailData = await request.json()
    const { userEmail, userName, userType, referralCode, hasReferralReward, businessBonus } = body

    // Validate required fields
    if (!userEmail || !userName || !userType || !referralCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if environment variables are available
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.error('Missing SMTP credentials for welcome email')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Profile link
    const profileLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?ref=${referralCode}`

    // Determine rewards text
    let rewardsText = ''
    let rewardsSection = ''
    
    if (userType === 'business' && businessBonus) {
      rewardsText = '🎉 **BUSINESS BONUS:** 3 months FREE Pro subscription!'
      rewardsSection = `
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
          <h3 style="margin: 0 0 10px 0; font-size: 20px;">🎉 Welcome Bonus Activated!</h3>
          <p style="margin: 0; font-size: 16px; opacity: 0.95;">
            <strong>3 Months FREE Pro Subscription</strong><br>
            Complete business management tools & premium features
          </p>
        </div>
      `
    } else if (hasReferralReward) {
      rewardsText = '🎁 **REFERRAL BONUS:** ₹25 welcome credits!'
      rewardsSection = `
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
          <h3 style="margin: 0 0 10px 0; font-size: 20px;">🎁 Referral Bonus!</h3>
          <p style="margin: 0; font-size: 16px; opacity: 0.95;">
            <strong>₹25 Welcome Credits</strong><br>
            Thanks for joining through a friend's referral!
          </p>
        </div>
      `
    } else {
      rewardsText = '🚀 **EARLY ADOPTER PERKS:** 50% off first 10 bookings!'
      rewardsSection = `
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
          <h3 style="margin: 0 0 10px 0; font-size: 20px;">🚀 Early Adopter Benefits!</h3>
          <p style="margin: 0; font-size: 16px; opacity: 0.95;">
            <strong>50% OFF First 10 Bookings</strong><br>
            Exclusive pre-launch member discount
          </p>
        </div>
      `
    }

    // Welcome email content
    const welcomeEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 15px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px 20px; border-radius: 15px 15px 0 0; text-align: center; margin: -20px -20px 0 -20px;">
          <div style="display: inline-flex; align-items: center; margin-bottom: 15px;">
            <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              📅
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">FastBookr</h1>
          </div>
          <h2 style="margin: 0; font-size: 24px; font-weight: normal; opacity: 0.95;">
            🎉 Welcome to the Future of Booking!
          </h2>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px; background: white; margin: 0 -20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="color: #1f2937; font-size: 22px; margin: 0 0 10px 0;">
              Hi ${userName}! 👋
            </h3>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
              Congratulations on joining FastBookr as ${userType === 'business' ? 'a business partner' : 'an early adopter'}! 
              You're now part of an exclusive community that's about to revolutionize booking.
            </p>
          </div>

          ${rewardsSection}
          
          <!-- Quick Actions -->
          <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
            <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">🚀 Get Started:</h4>
            
            <div style="margin-bottom: 15px;">
              <a href="${profileLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px; margin-bottom: 10px;">
                📊 View Your Profile
              </a>
            </div>
            
            <div style="margin-bottom: 15px;">
              <a href="${referralLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px; margin-bottom: 10px;">
                🎁 Share & Earn Rewards
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
              💡 <strong>Your Referral Code:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${referralCode}</code>
            </p>
          </div>
          
          <!-- Features Preview -->
          <div style="margin: 30px 0;">
            <h4 style="color: #374151; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
              ✨ What You'll Get When We Launch:
            </h4>
            
            <div style="display: grid; gap: 15px;">
              ${userType === 'business' ? `
                <div style="display: flex; align-items: center; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <span style="font-size: 24px; margin-right: 12px;">📈</span>
                  <div>
                    <strong style="color: #92400e;">Business Dashboard</strong><br>
                    <span style="color: #a16207; font-size: 14px;">Manage bookings, analytics, and customer insights</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <span style="font-size: 24px; margin-right: 12px;">⚡</span>
                  <div>
                    <strong style="color: #1d4ed8;">Real-time Booking System</strong><br>
                    <span style="color: #2563eb; font-size: 14px;">Instant confirmations and automated scheduling</span>
                  </div>
                </div>
              ` : `
                <div style="display: flex; align-items: center; padding: 15px; background: #dcfce7; border-radius: 8px; border-left: 4px solid #10b981;">
                  <span style="font-size: 24px; margin-right: 12px;">🎯</span>
                  <div>
                    <strong style="color: #065f46;">Skip All Waiting Lines</strong><br>
                    <span style="color: #047857; font-size: 14px;">Book instantly at restaurants, salons, and more</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <span style="font-size: 24px; margin-right: 12px;">💰</span>
                  <div>
                    <strong style="color: #92400e;">Exclusive Discounts</strong><br>
                    <span style="color: #a16207; font-size: 14px;">Member-only deals and loyalty rewards</span>
                  </div>
                </div>
              `}
              
              <div style="display: flex; align-items: center; padding: 15px; background: #f3e8ff; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                <span style="font-size: 24px; margin-right: 12px;">📱</span>
                <div>
                  <strong style="color: #6b21a8;">Mobile App</strong><br>
                  <span style="color: #7c3aed; font-size: 14px;">Book on-the-go with our mobile app (coming soon)</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Community -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 10%, #fef3c7 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">
              🌟 Join Our Community
            </h4>
            <p style="color: #a16207; margin: 0 0 15px 0; font-size: 14px;">
              Connect with other early adopters and get exclusive updates
            </p>
            <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
              <a href="https://wa.me/919098523694" style="display: inline-block; background: #25d366; color: white; padding: 8px 15px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold;">
                WhatsApp
              </a>
              <a href="#" style="display: inline-block; background: #1da1f2; color: white; padding: 8px 15px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold;">
                Twitter
              </a>
              <a href="#" style="display: inline-block; background: #1877f2; color: white; padding: 8px 15px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold;">
                Facebook
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Thank you for being part of this journey! We can't wait to show you what we've been building.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              Best regards,<br>
              <strong style="color: #1f2937;">The FastBookr Team</strong> 🚀
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 15px 15px; text-align: center; margin: 0 -20px -20px -20px;">
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">FastBookr</strong><br>
            <span style="color: #6b7280; font-size: 14px;">Skip the Wait, Book Instantly</span>
          </div>
          <div style="color: #6b7280; font-size: 12px; line-height: 1.5;">
            📧 <strong>Email:</strong> hello@fastbookr.com<br>
            📱 <strong>Phone:</strong> +91 9098523694<br>
            🌐 <strong>Website:</strong> fastbookr.com
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              This email was sent to ${userEmail}. You're receiving this because you signed up for FastBookr.<br>
              © 2024 FastBookr. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `

    // Send welcome email
    await transporter.sendMail({
      from: `"FastBookr Team" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `🎉 Welcome to FastBookr, ${userName}! Your ${userType === 'business' ? 'Business' : 'Early Adopter'} Journey Begins`,
      html: welcomeEmailContent,
    })

    console.log(`Welcome email sent successfully to ${userEmail}`)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Welcome email sent successfully' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
} 