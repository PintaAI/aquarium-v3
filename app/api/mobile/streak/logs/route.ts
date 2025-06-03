import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyMobileToken, AuthenticationError } from '@/lib/mobile-auth-middleware';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100); // Max 100 items
    const skip = (page - 1) * limit;

    console.log(`📊 Fetching activity logs - Page: ${page}, Limit: ${limit}`);

    // Fetch activity logs with user information
    const activityLogs = await db.activityLog.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Get total count for pagination
    const total = await db.activityLog.count();

    const response = {
      success: true,
      data: activityLogs.map((log: any) => ({
        id: log.id,
        userId: log.userId,
        type: log.type,
        description: log.description,
        previousStreak: log.previousStreak,
        newStreak: log.newStreak,
        xpEarned: log.xpEarned,
        createdAt: log.createdAt.toISOString(),
        user: log.user ? {
          name: log.user.name,
          email: log.user.email
        } : null
      })),
      total,
      page,
      limit,
      hasNextPage: skip + limit < total,
      hasPrevPage: page > 1
    };

    console.log(`✅ Retrieved ${activityLogs.length} activity logs`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching activity logs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch activity logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}