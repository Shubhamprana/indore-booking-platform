import { NextRequest, NextResponse } from 'next/server'
import { sendRewardNotificationDirect } from '../../../lib/reward-email-service'

interface RewardNotificationData {
  userEmail: string
  userName: string
  rewardType: 'points' | 'credits' | 'pro_subscription' | 'referral_bonus' | 'achievement' | 'cashback' | 'discount'
  amount?: number
  description: string
  expiryDate?: string
  source?: string
  profileLink?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RewardNotificationData = await request.json()
    const { userEmail, userName, rewardType, amount, description, expiryDate, source, profileLink } = body

    // Validate required fields
    if (!userEmail || !userName || !rewardType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, userName, rewardType, description' },
        { status: 400 }
      )
    }

    // Check if environment variables are available
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.error('Missing SMTP credentials for reward notification')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Send reward notification email
    await sendRewardNotificationDirect({
      userEmail,
      userName,
      rewardType,
      amount,
      description,
      expiryDate,
      source,
      profileLink
    })

    console.log(`Reward notification sent to ${userEmail} for ${rewardType}`)

    return NextResponse.json({
      success: true,
      message: 'Reward notification email sent successfully',
      rewardType,
      recipient: userEmail
    })

  } catch (error) {
    console.error('Reward notification API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reward notification'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Reward Notification Email API',
    endpoint: '/api/reward-notification',
    method: 'POST',
    supportedRewards: [
      'points',
      'credits', 
      'pro_subscription',
      'referral_bonus',
      'achievement',
      'cashback',
      'discount'
    ],
    requiredFields: ['userEmail', 'userName', 'rewardType', 'description'],
    optionalFields: ['amount', 'expiryDate', 'source', 'profileLink'],
    smtpConfigured: {
      email: !!process.env.SMTP_EMAIL,
      password: !!process.env.SMTP_PASSWORD
    }
  })
} 