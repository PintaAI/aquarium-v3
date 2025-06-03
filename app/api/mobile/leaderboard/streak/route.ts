import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// GET /api/mobile/leaderboard/streak
// Get streak-based leaderboard
export async function GET(req: NextRequest) {
  try {
    console.log("🔥 Starting streak leaderboard fetch...");
    
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

    // Get top users by current streak, then by max streak, then by XP
    const topUsers = await db.user.findMany({
      orderBy: [
        { currentStreak: 'desc' },
        { maxStreak: 'desc' },
        { xp: 'desc' }
      ],
      take: validLimit,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        currentStreak: true,
        maxStreak: true,
        lastActivityDate: true
      }
    });

    // Get current user's data and rank
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
        maxStreak: true,
        lastActivityDate: true
      }
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate current user's rank for streak leaderboard
    const higherRankedCount = await db.user.count({
      where: {
        OR: [
          { currentStreak: { gt: currentUserData.currentStreak } },
          {
            AND: [
              { currentStreak: currentUserData.currentStreak },
              { maxStreak: { gt: currentUserData.maxStreak } }
            ]
          },
          {
            AND: [
              { currentStreak: currentUserData.currentStreak },
              { maxStreak: currentUserData.maxStreak },
              { xp: { gt: currentUserData.xp } }
            ]
          }
        ]
      }
    });

    const currentUserRank = higherRankedCount + 1;

    // Get total user count
    const totalUsers = await db.user.count();

    // Calculate if streaks should be reset based on last activity
    const now = new Date();
    const leaderboardUsers = topUsers.map((user, index) => {
      let adjustedCurrentStreak = user.currentStreak;
      
      // Check if streak should be reset (more than 1 day gap)
      if (user.lastActivityDate) {
        const daysSinceLastActivity = Math.floor(
          (now.getTime() - user.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastActivity > 1) {
          adjustedCurrentStreak = 0;
        }
      }

      return {
        id: user.id,
        name: user.name || 'Anonymous',
        email: user.email,
        image: user.image,
        xp: user.xp,
        level: user.level,
        currentStreak: adjustedCurrentStreak,
        maxStreak: user.maxStreak,
        rank: index + 1
      };
    });

    // Apply same logic to current user
    let adjustedCurrentUserStreak = currentUserData.currentStreak;
    if (currentUserData.lastActivityDate) {
      const daysSinceLastActivity = Math.floor(
        (now.getTime() - currentUserData.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastActivity > 1) {
        adjustedCurrentUserStreak = 0;
      }
    }

    const currentUser = {
      id: currentUserData.id,
      name: currentUserData.name || 'Anonymous',
      email: currentUserData.email,
      image: currentUserData.image,
      xp: currentUserData.xp,
      level: currentUserData.level,
      currentStreak: adjustedCurrentUserStreak,
      maxStreak: currentUserData.maxStreak,
      rank: currentUserRank
    };

    console.log(`✅ Retrieved streak leaderboard with ${leaderboardUsers.length} users`);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        users: leaderboardUsers,
        currentUser: currentUser,
        totalUsers: totalUsers
      }
    });

  } catch (error) {
    console.error("[API_LEADERBOARD_STREAK_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch streak leaderboard" },
      { status: 500 }
    );
  }
}