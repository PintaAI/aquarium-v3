import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken, AuthenticationError } from "@/lib/mobile-auth-middleware";

// GET /api/mobile/leaderboard
// Redirect to XP leaderboard or provide leaderboard types info
export async function GET(req: NextRequest) {
  try {
    console.log("📋 Leaderboard info request...");
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    
    try {
      await verifyMobileToken(authHeader);
    } catch (authError) {
      const statusCode = authError instanceof AuthenticationError ? authError.statusCode : 401;
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: statusCode }
      );
    }

    // Provide available leaderboard endpoints
    return NextResponse.json({ 
      success: true, 
      data: {
        message: 'Leaderboard API endpoints',
        endpoints: {
          xp: '/api/mobile/leaderboard/xp',
          streak: '/api/mobile/leaderboard/streak',
          activity: '/api/mobile/leaderboard/activity'
        },
        description: 'Use specific endpoints for different leaderboard types'
      }
    });

  } catch (error) {
    console.error("[API_LEADERBOARD_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to get leaderboard info" },
      { status: 500 }
    );
  }
}