import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// GET /api/mobile/leaderboard/xp
// Get XP-based leaderboard
export async function GET(req: NextRequest) {
  try {
    console.log("🏆 Starting XP leaderboard fetch...");
    
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

    // Get top users by XP
    const topUsers = await db.user.findMany({
      orderBy: [
        { xp: 'desc' },
        { level: 'desc' },
        { maxStreak: 'desc' }
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
        maxStreak: true
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
        maxStreak: true
      }
    });

    if (!currentUserData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate current user's rank
    const higherRankedCount = await db.user.count({
      where: {
        OR: [
          { xp: { gt: currentUserData.xp } },
          {
            AND: [
              { xp: currentUserData.xp },
              { level: { gt: currentUserData.level } }
            ]
          },
          {
            AND: [
              { xp: currentUserData.xp },
              { level: currentUserData.level },
              { maxStreak: { gt: currentUserData.maxStreak } }
            ]
          }
        ]
      }
    });

    const currentUserRank = higherRankedCount + 1;

    // Get total user count
    const totalUsers = await db.user.count();

    // Format response data
    const leaderboardUsers = topUsers.map((user, index) => ({
      id: user.id,
      name: user.name || 'Anonymous',
      email: user.email,
      image: user.image,
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      rank: index + 1
    }));

    const currentUser = {
      id: currentUserData.id,
      name: currentUserData.name || 'Anonymous',
      email: currentUserData.email,
      image: currentUserData.image,
      xp: currentUserData.xp,
      level: currentUserData.level,
      currentStreak: currentUserData.currentStreak,
      maxStreak: currentUserData.maxStreak,
      rank: currentUserRank
    };

    console.log(`✅ Retrieved XP leaderboard with ${leaderboardUsers.length} users`);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        users: leaderboardUsers,
        currentUser: currentUser,
        totalUsers: totalUsers
      }
    });

  } catch (error) {
    console.error("[API_LEADERBOARD_XP_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch XP leaderboard" },
      { status: 500 }
    );
  }
}