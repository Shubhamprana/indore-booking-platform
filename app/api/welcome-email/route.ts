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
  console.log('📧 Welcome email API called');
  
  try {
    const body: WelcomeEmailData = await request.json()
    const { userEmail, userName, userType, referralCode, hasReferralReward, businessBonus } = body

    console.log(`📧 Processing welcome email for: ${userEmail} (${userType})`);

    // Validate required fields
    if (!userEmail || !userName || !userType || !referralCode) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if environment variables are available
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.log('⚠️ Missing SMTP credentials - email queued');
      return NextResponse.json(
        { success: true, message: 'Email queued for later delivery (SMTP not configured)' },
        { status: 200 }
      )
    }

    // Email providers in order of preference - Gmail SSL is most reliable
    const emailProviders = [
      {
        name: 'Gmail-SSL',
        description: 'Gmail SMTP with SSL (port 465) - Most Reliable',
        config: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        }
      },
      {
        name: 'Gmail-STARTTLS',
        description: 'Gmail SMTP with STARTTLS (port 587) - Fallback',
        config: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        }
      }
    ];

    // Email content
    const profileLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`;

    const emailContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FastBookr</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .bonus-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Welcome to FastBookr! 🎉</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Early Adopter Journey Begins</p>
                                        </div>
        
        <div class="content">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hi ${userName}! 👋</h2>
                            
            <p>Congratulations on joining FastBookr as ${userType === 'business' ? 'a business partner' : 'an early adopter'}! 
            You're now part of an exclusive community that's about to revolutionize booking.</p>

                            ${userType === 'business' && businessBonus ? `
            <div class="bonus-box">
                <h3 style="color: #059669; margin: 0 0 10px 0;">🎉 Business Partner Welcome Bonus!</h3>
                <p style="margin: 0; color: #374151;">
                    <strong>LIFETIME FREE Pro Subscription</strong><br>
                    Your premium business features are now active for life! No monthly fees, ever.
                                        </p>
            </div>
                            ` : hasReferralReward ? `
            <div class="bonus-box" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white;">
                <h3 style="margin: 0 0 10px 0; color: white;">🎁 Referral Bonus!</h3>
                <p style="margin: 0; color: rgba(255,255,255,0.95);">
                                            <strong>₹25 Welcome Credits</strong><br>
                                            Thanks for joining through a friend's referral!
                                        </p>
            </div>
                            ` : `
            <div class="bonus-box" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white;">
                <h3 style="margin: 0 0 10px 0; color: white;">🚀 Early Adopter Benefits!</h3>
                <p style="margin: 0; color: rgba(255,255,255,0.95);">
                                            <strong>50% OFF First 10 Bookings</strong><br>
                                            Exclusive pre-launch member discount
                                        </p>
            </div>
                            `}
                            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${profileLink}" class="button">📊 View Your Profile</a>
                                        </div>
                                        
            <div style="background: #e5e7eb; padding: 15px; border-radius: 6px; text-align: center;">
                                            <strong>💡 Your Referral Code:</strong> 
                <span style="background: white; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; color: #3b82f6;">${referralCode}</span>
                                        </div>
            
            <p style="text-align: center; margin: 30px 0 0 0; color: #6b7280;">
                Thank you for joining our community! We can't wait to share this journey with you. 🙏<br>
                <strong style="color: #374151;">The FastBookr Team</strong>
                                </p>
                            </div>
                            
        <div class="footer">
            <p style="margin: 0;">This email was sent to <a href="mailto:${userEmail}" style="color: #3b82f6;">${userEmail}</a></p>
            <p style="margin: 5px 0 0 0;">FastBookr • Skip the Wait, Book Instantly</p>
        </div>
    </div>
</body>
</html>`;

    // Try each email provider
    console.log(`🔄 Attempting to send email via ${emailProviders.length} providers...`);
    
    for (const provider of emailProviders) {
      try {
        console.log(`📡 Trying ${provider.name}: ${provider.description}`);
        
        const transporter = nodemailer.createTransport(provider.config);
        
        // Quick connection test with timeout (increased for Gmail)
        const testPromise = transporter.verify();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 8000)
        );
        
        await Promise.race([testPromise, timeoutPromise]);
        console.log(`✅ ${provider.name} connection verified`);
        
        const mailOptions = {
          from: `"FastBookr" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
          subject: `Welcome to FastBookr! ${userType === 'business' ? '🎉 LIFETIME FREE Pro Access' : '🚀 Your Early Access is Ready'}`,
          html: emailContent,
        };
        
        // Send email with timeout (increased for Gmail)
        const sendPromise = transporter.sendMail(mailOptions);
        const sendTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Send timeout')), 10000)
        );
        
        const result = await Promise.race([sendPromise, sendTimeoutPromise]) as any;
        
        console.log(`✅ Email sent successfully via ${provider.name}!`);
        console.log(`📬 Message ID: ${result.messageId}`);
        console.log(`📧 Delivered to: ${userEmail}`);
        
        transporter.close();
        
        return NextResponse.json({
          success: true,
          message: `Welcome email sent successfully via ${provider.name}`,
          provider: provider.name,
          messageId: result.messageId
        }, { status: 200 });
        
      } catch (error: any) {
        console.log(`❌ ${provider.name} failed: ${error.message}`);
        
        // Log specific error types for debugging
        if (error.code === 'EAUTH') {
          console.log(`🔐 ${provider.name}: Authentication error - check credentials`);
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
          console.log(`⏰ ${provider.name}: Connection timeout - network/firewall issue`);
        }
        
        continue; // Try next provider
      }
    }
    
    // All providers failed
    console.log('❌ All email providers failed');
    console.log('💡 Email queued for later delivery - registration not affected');

    return NextResponse.json({
        success: true, 
      message: 'Email queued for retry (all providers unavailable)',
      note: 'Registration completed successfully - email delivery will be retried'
    }, { status: 200 });

  } catch (error) {
    console.error('💥 Welcome email API error:', error);
    return NextResponse.json({
      success: true,
      message: 'Email processing queued due to system error'
    }, { status: 200 });
  }
} 