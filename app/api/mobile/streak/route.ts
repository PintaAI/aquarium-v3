import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// GET /api/mobile/streak
// Get user's current streak information
export async function GET(req: NextRequest) {
  try {
    console.log("🔥 Starting streak fetch...");
    
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

    // Get user's streak data
    const userData = await db.user.findUnique({
      where: { id: user.sub },
      select: {
        currentStreak: true,
        maxStreak: true,
        lastActivityDate: true,
        xp: true,
        level: true
      }
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get recent activity logs for calendar display
    const recentActivityLogs = await db.activityLog.findMany({
      where: {
        userId: user.sub
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Last 20 activities (to cover more days)
      select: {
        id: true,
        type: true,
        description: true,
        previousStreak: true,
        newStreak: true,
        xpEarned: true,
        createdAt: true
      }
    });

    // Calculate days since last activity
    const daysSinceLastActivity = userData.lastActivityDate 
      ? Math.floor((new Date().getTime() - userData.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Check if streak should be reset (more than 1 day gap)
    const shouldResetStreak = daysSinceLastActivity !== null && daysSinceLastActivity > 1;

    const responseData = {
      currentStreak: shouldResetStreak ? 0 : userData.currentStreak,
      maxStreak: userData.maxStreak,
      lastActivityDate: userData.lastActivityDate,
      daysSinceLastActivity,
      shouldResetStreak,
      xp: userData.xp,
      level: userData.level,
      recentActivities: recentActivityLogs,
      streakStatus: {
        isActive: !shouldResetStreak && userData.currentStreak > 0,
        canContinueToday: daysSinceLastActivity === 0,
        needsActivityToday: daysSinceLastActivity === 1,
        missedDays: daysSinceLastActivity && daysSinceLastActivity > 1 ? daysSinceLastActivity - 1 : 0
      }
    };

    console.log(`✅ Retrieved streak data for user: ${user.email || user.sub}`);
    
    return NextResponse.json({ 
      success: true, 
      data: responseData 
    });

  } catch (error) {
    console.error("[API_STREAK_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }
}

// POST /api/mobile/streak/activity
// Record a new activity and update streak
export async function POST(req: NextRequest) {
  try {
    console.log("🎯 Starting activity recording...");
    
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

    const body = await req.json();
    const { 
      type, 
      description, 
      xpEarned = 0, 
      metadata 
    } = body;

    // Validate activity type
    const validActivityTypes = [
      'LOGIN', 'COMPLETE_MODULE', 'COMPLETE_COURSE', 'COMPLETE_QUIZ',
      'VOCABULARY_PRACTICE', 'DAILY_CHALLENGE', 'SUBMIT_ASSIGNMENT',
      'PARTICIPATE_LIVE_SESSION', 'PLAY_GAME', 'OTHER'
    ];

    if (!type || !validActivityTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    // Get current user data
    const currentUser = await db.user.findUnique({
      where: { id: user.sub }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate streak logic
    const lastActivityDate = currentUser.lastActivityDate;
    let newStreak = currentUser.currentStreak;
    let streakUpdated = false;
    
    if (!lastActivityDate) {
      // First activity ever
      newStreak = 1;
      streakUpdated = true;
    } else {
      const lastActivityDay = new Date(
        lastActivityDate.getFullYear(),
        lastActivityDate.getMonth(),
        lastActivityDate.getDate()
      );
      
      const daysDifference = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference === 1) {
        // Continue streak (activity yesterday, now today)
        newStreak = currentUser.currentStreak + 1;
        streakUpdated = true;
      } else if (daysDifference === 0) {
        // Same day activity, don't update streak
        newStreak = currentUser.currentStreak;
        streakUpdated = false;
      } else if (daysDifference > 1) {
        // Streak broken, reset to 1
        newStreak = 1;
        streakUpdated = true;
      }
    }

    // Calculate new level based on XP
    const newXP = currentUser.xp + xpEarned;
    const newLevel = Math.floor(newXP / 1000) + 1; // 1000 XP per level
    const leveledUp = newLevel > currentUser.level;

    // Update user data and create activity log in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: user.sub },
        data: {
          currentStreak: newStreak,
          maxStreak: Math.max(newStreak, currentUser.maxStreak),
          lastActivityDate: now,
          xp: newXP,
          level: newLevel
        }
      });

      // Create activity log
      const activityLog = await tx.activityLog.create({
        data: {
          userId: user.sub,
          type: type,
          description: description || `User completed ${type.toLowerCase().replace('_', ' ')}`,
          xpEarned: xpEarned,
          streakUpdated: streakUpdated,
          previousStreak: currentUser.currentStreak,
          newStreak: newStreak,
          previousLevel: currentUser.level,
          newLevel: newLevel,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });

      return { updatedUser, activityLog };
    });

    const responseData = {
      streak: {
        previous: currentUser.currentStreak,
        current: newStreak,
        max: result.updatedUser.maxStreak,
        updated: streakUpdated
      },
      xp: {
        previous: currentUser.xp,
        earned: xpEarned,
        current: newXP
      },
      level: {
        previous: currentUser.level,
        current: newLevel,
        leveledUp: leveledUp
      },
      activity: {
        id: result.activityLog.id,
        type: type,
        description: result.activityLog.description,
        createdAt: result.activityLog.createdAt
      }
    };

    console.log(`✅ Activity recorded for user: ${user.email || user.sub}`);
    console.log(`🔥 Streak: ${currentUser.currentStreak} → ${newStreak}`);
    
    return NextResponse.json({
      success: true,
      data: responseData,
      message: streakUpdated 
        ? `Streak ${newStreak > currentUser.currentStreak ? 'continued' : 'reset'}! Current streak: ${newStreak}`
        : `Activity recorded! Current streak: ${newStreak}`
    });

  } catch (error) {
    console.error("[API_STREAK_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to record activity" },
      { status: 500 }
    );
  }
}
