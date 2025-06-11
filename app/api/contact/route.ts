import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, category, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if environment variables are available
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.error('Missing SMTP credentials:', {
        hasEmail: !!process.env.SMTP_EMAIL,
        hasPassword: !!process.env.SMTP_PASSWORD
      })
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    console.log('Attempting to send email with SMTP credentials...')

    // Create transporter using Gmail SMTP SSL (same config as welcome emails)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })

    // Test the connection first
    try {
      await transporter.verify()
      console.log('SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError)
      return NextResponse.json(
        { error: 'Email service configuration error. Please check credentials.' },
        { status: 500 }
      )
    }

    // Email content for you (the site owner)
    const ownerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📧 New Contact Form Submission</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">FastBookr Contact Form</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Contact Details
          </h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #6b7280;">👤 Name:</strong>
            <span style="color: #111827; margin-left: 10px;">${name}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #6b7280;">📧 Email:</strong>
            <span style="color: #111827; margin-left: 10px;">${email}</span>
          </div>
          
          ${phone ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #6b7280;">📱 Phone:</strong>
            <span style="color: #111827; margin-left: 10px;">${phone}</span>
          </div>
          ` : ''}
          
          ${category ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #6b7280;">🏷️ Category:</strong>
            <span style="color: #111827; margin-left: 10px;">${category}</span>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #6b7280;">📝 Subject:</strong>
            <span style="color: #111827; margin-left: 10px;">${subject}</span>
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #6b7280;">💬 Message:</strong>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>⏰ Received:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </p>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            This email was sent from the FastBookr contact form.<br>
            Please respond directly to <strong>${email}</strong>
          </p>
        </div>
      </div>
    `

    // Email content for the user (auto-reply)
    const userEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Thank You for Contacting Us!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">FastBookr Team</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for reaching out to us! We've received your message and our team will get back to you within <strong>24 hours</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color: #059669; margin: 0 0 10px 0;">📋 Your Message Summary:</h3>
            <p style="color: #374151; margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>Category:</strong> ${category || 'General Inquiry'}</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            In the meantime, you can:
          </p>
          
          <ul style="color: #374151; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li style="margin-bottom: 8px;">📱 Follow us on social media for updates</li>
            <li style="margin-bottom: 8px;">🔔 Join our pre-launch community</li>
            <li style="margin-bottom: 8px;">📚 Check out our FAQ section</li>
          </ul>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #1e40af; margin: 0; font-weight: bold;">
              🚀 FastBookr is launching soon!
            </p>
            <p style="color: #1e40af; margin: 5px 0 0 0; font-size: 14px;">
              Be among the first to experience seamless booking
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>The FastBookr Team</strong>
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            📧 <strong>Email:</strong> hello@fastbookr.com<br>
            📱 <strong>Phone:</strong> +91 9098523694<br>
            🌐 <strong>Website:</strong> fastbookr.com
          </p>
        </div>
      </div>
    `

    // Send email to site owner
    await transporter.sendMail({
      from: `"FastBookr Contact Form" <${process.env.SMTP_EMAIL}>`,
      to: 'mrdrsp4@gmail.com',
      subject: `🔔 New Contact Form: ${subject}`,
      html: ownerEmailContent,
      replyTo: email, // Allow easy reply to the user
    })

    // Send auto-reply to user
    await transporter.sendMail({
      from: `"FastBookr Team" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `✅ We received your message: ${subject}`,
      html: userEmailContent,
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email sent successfully! We\'ll get back to you within 24 hours.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    )
  }
} 