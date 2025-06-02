import { NextRequest, NextResponse } from 'next/server'
import { 
  getUserStats, 
  getUserStatsWithRecalculation,
  getUserAchievements,
  getUserActivities,
  getUserReferrals,
  getTotalUserCount
} from '@/lib/user-stats'
import { getUserFollowStats } from '@/lib/follow-system'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const limit = searchParams.get('limit')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    switch (action) {
      case 'stats':
        const stats = await getUserStats(userId)
        return NextResponse.json({ success: true, data: stats })

      case 'stats-recalculate':
        const recalculatedStats = await getUserStatsWithRecalculation(userId)
        return NextResponse.json({ success: true, data: recalculatedStats })

      case 'achievements':
        const achievements = await getUserAchievements(userId)
        return NextResponse.json({ success: true, data: achievements })

      case 'activities':
        const activityLimit = limit ? parseInt(limit) : 10
        const activities = await getUserActivities(userId, activityLimit)
        return NextResponse.json({ success: true, data: activities })

      case 'referrals':
        const referrals = await getUserReferrals(userId)
        return NextResponse.json({ success: true, data: referrals })

      case 'follow-stats':
        const userFollowStats = await getUserFollowStats(userId)
        return NextResponse.json({ success: true, data: userFollowStats })

      case 'total-users':
        const totalUsers = await getTotalUserCount()
        return NextResponse.json({ success: true, data: totalUsers })

      case 'all':
        // Get all data in parallel
        const [
          userStatsResult,
          userAchievementsResult,
          userActivitiesResult,
          userReferralsResult,
          followStatsResult,
          totalCountResult
        ] = await Promise.allSettled([
          getUserStats(userId),
          getUserAchievements(userId),
          getUserActivities(userId, 5),
          getUserReferrals(userId),
          getUserFollowStats(userId),
          getTotalUserCount()
        ])

        return NextResponse.json({
          success: true,
          data: {
            stats: userStatsResult.status === 'fulfilled' ? userStatsResult.value : null,
            achievements: userAchievementsResult.status === 'fulfilled' ? userAchievementsResult.value : [],
            activities: userActivitiesResult.status === 'fulfilled' ? userActivitiesResult.value : [],
            referrals: userReferralsResult.status === 'fulfilled' ? userReferralsResult.value : [],
            followStats: followStatsResult.status === 'fulfilled' ? followStatsResult.value : { followers_count: 0, following_count: 0 },
            totalUsers: totalCountResult.status === 'fulfilled' ? totalCountResult.value : 15847
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('User stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'clear-cache') {
      const { userId } = await request.json()
      
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
      }

      // Clear user stats cache
      const { clearUserStatsCache } = await import('@/lib/user-stats')
      clearUserStatsCache(userId)

      return NextResponse.json({ success: true, message: 'Cache cleared' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('User stats POST API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 