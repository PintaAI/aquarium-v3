import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// GET /api/mobile/leaderboard/activity
// Get activity-based leaderboard (most active users based on recent activity logs)
export async function GET(req: NextRequest) {
  try {
    console.log("⚡ Starting activity leaderboard fetch...");
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    let user;
    
    try {
      user = await verifyMobileToken(authHeader);
    } catch (authError) {
      const statusCode = authError instanceof AuthenticationError ? authError.statusCode : 401;
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: statusCode }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const validLimit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100
    const days = parseInt(url.searchParams.get('days') || '30'); // Default to 30 days
    const validDays = Math.min(Math.max(days, 1), 365); // Between 1 and 365 days

    // Calculate date range for activity
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - validDays);

    // Get activity counts for each user in the specified time period
    const userActivityCounts = await db.activityLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      _sum: {
        xpEarned: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: validLimit * 2 // Get more to account for users that might not exist
    });

    // Get user details for the most active users
    const userIds = userActivityCounts.map(activity => activity.userId);
    
    const usersData = await db.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        currentStreak: true,
        maxStreak: true
      }
    });

    // Create a map for quick user lookup
    const usersMap = new Map(usersData.map(user => [user.id, user]));

    // Combine activity data with user data and sort by activity count
    const leaderboardData = userActivityCounts
      .map(activity => {
        const user = usersMap.get(activity.userId);
        if (!user) return null;
        
        return {
          id: user.id,
          name: user.name || 'Anonymous',
          email: user.email,
          image: user.image,
          xp: user.xp,
          level: user.level,
          currentStreak: user.currentStreak,
          maxStreak: user.maxStreak,
          activityCount: activity._count.id,
          totalXpEarned: activity._sum.xpEarned || 0
        };
      })
      .filter(Boolean) // Remove null entries
      .slice(0, validLimit); // Take only the requested limit

    // Add rank to each user
    const leaderboardUsers = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Get current user's data and activity count
    const currentUserData = await db.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        currentStreak: true,
        maxStreak: true
      }
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current user's activity count in the specified period
    const currentUserActivity = await db.activityLog.aggregate({
      where: {
        userId: user.sub,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      _sum: {
        xpEarned: true
      }
    });

    // Calculate current user's rank in activity leaderboard
    const higherRankedCount = await db.activityLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gt: currentUserActivity._count.id || 0
          }
        }
      }
    });

    const currentUserRank = higherRankedCount.length + 1;

    // Get total user count (users who have any activity)
    const totalActiveUsers = await db.activityLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const currentUser = {
      id: currentUserData.id,
      name: currentUserData.name || 'Anonymous',
      email: currentUserData.email,
      image: currentUserData.image,
      xp: currentUserData.xp,
      level: currentUserData.level,
      currentStreak: currentUserData.currentStreak,
      maxStreak: currentUserData.maxStreak,
      activityCount: currentUserActivity._count.id || 0,
      totalXpEarned: currentUserActivity._sum.xpEarned || 0,
      rank: currentUserRank
    };

    console.log(`✅ Retrieved activity leaderboard with ${leaderboardUsers.length} users (${validDays} days)`);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        users: leaderboardUsers,
        currentUser: currentUser,
        totalUsers: totalActiveUsers.length,
        period: {
          days: validDays,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    });

  } catch (error) {
    console.error("[API_LEADERBOARD_ACTIVITY_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity leaderboard" },
      { status: 500 }
    );
  }
}