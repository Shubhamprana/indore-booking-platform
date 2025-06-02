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
      secure: true,
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      }
    })

    // Profile link
    const profileLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?ref=${referralCode}`

    // Welcome email content with beautiful HTML template
    const welcomeEmailContent = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to FastBookr</title>
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
                        <td align="center" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); background-color: #3b82f6; padding: 40px 20px; text-align: center;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <!-- Icon -->
                                        <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px auto; display: table; text-align: center;">
                                            <div style="display: table-cell; vertical-align: middle; font-size: 40px;">🎉</div>
                                        </div>
                                        <!-- Title -->
                                        <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 8px 0; text-align: center;">Welcome to FastBookr!</h1>
                                        <!-- Subtitle -->
                                        <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0; font-weight: 500;">Your Early Adopter Journey Begins</p>
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
                                Congratulations on joining FastBookr as ${userType === 'business' ? 'a business partner' : 'an early adopter'}! 
                                You're now part of an exclusive community that's about to revolutionize booking.
                            </p>

                            <!-- Bonus Section -->
                            ${userType === 'business' && businessBonus ? `
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); background-color: #10b981; color: white; padding: 30px; border-radius: 12px; text-align: center;">
                                        <div style="font-size: 48px; margin-bottom: 15px; line-height: 1;">🎉</div>
                                        <h3 style="margin: 0 0 10px 0; font-size: 22px; font-weight: bold; color: #ffffff;">Business Bonus Activated!</h3>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            <strong>3 Months FREE Pro Subscription</strong><br>
                                            Complete business management tools & premium features
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            ` : hasReferralReward ? `
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); background-color: #f59e0b; color: white; padding: 30px; border-radius: 12px; text-align: center;">
                                        <div style="font-size: 48px; margin-bottom: 15px; line-height: 1;">🎁</div>
                                        <h3 style="margin: 0 0 10px 0; font-size: 22px; font-weight: bold; color: #ffffff;">Referral Bonus!</h3>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            <strong>₹25 Welcome Credits</strong><br>
                                            Thanks for joining through a friend's referral!
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            ` : `
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); background-color: #3b82f6; color: white; padding: 30px; border-radius: 12px; text-align: center;">
                                        <div style="font-size: 48px; margin-bottom: 15px; line-height: 1;">🚀</div>
                                        <h3 style="margin: 0 0 10px 0; font-size: 22px; font-weight: bold; color: #ffffff;">Early Adopter Benefits!</h3>
                                        <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                                            <strong>50% OFF First 10 Bookings</strong><br>
                                            Exclusive pre-launch member discount
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            `}
                            
                            <!-- Quick Actions -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f9fafb; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h4 style="color: #374151; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">🚀 Get Started:</h4>
                                        
                                        <div style="margin-bottom: 15px;">
                                            <a href="${profileLink}" 
                                               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px; margin-bottom: 10px;">
                                                📊 View Your Profile
                                            </a>
                                        </div>
                                        
                                        <div style="background: #e5e7eb; color: #374151; padding: 12px; border-radius: 6px; margin-top: 15px; text-align: center;">
                                            <strong>💡 Your Referral Code:</strong> 
                                            <span style="background: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; color: #3b82f6;">${referralCode}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing -->
                            <div style="text-align: center; margin: 30px 0 20px 0;">
                                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                                    Thank you for joining our community! We can't wait to share this journey with you. 🙏
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
                                <a href="${profileLink}" style="color: #3b82f6; text-decoration: none;">Manage Account</a> | 
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

    // Send welcome email
    await transporter.sendMail({
      from: `"FastBookr Team" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: `Welcome to FastBookr - ${userName}`,
      html: welcomeEmailContent,
      text: `Hi ${userName},

Welcome to FastBookr! ${userType === 'business' ? 'Thank you for joining as a business partner.' : 'Thank you for joining our community.'}

${userType === 'business' && businessBonus ? '🎉 **BUSINESS BONUS:** 3 months FREE Pro subscription!' : hasReferralReward ? '🎁 **REFERRAL BONUS:** ₹25 welcome credits!' : '🚀 **EARLY ADOPTER PERKS:** 50% off first 10 bookings!'}

Visit your profile: ${profileLink}
Share your referral code: ${referralCode}

Best regards,
The FastBookr Team

---
This email was sent because you registered for a FastBookr account.
Manage your preferences: ${profileLink}`,
      // Enhanced email headers for better deliverability and rendering
      headers: {
        'X-Mailer': 'FastBookr Welcome System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe>`,
        'MIME-Version': '1.0',
        'Content-Type': 'multipart/alternative'
      },
      // Enhanced email options for better rendering
      encoding: 'utf8',
      alternatives: [
        {
          contentType: 'text/html; charset=utf-8',
          content: welcomeEmailContent
        }
      ],
      // Message ID for better deliverability
      messageId: `welcome-${userType}-${Date.now()}@fastbookr.com`,
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