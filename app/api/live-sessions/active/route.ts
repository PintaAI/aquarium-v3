import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  // Return response with no-cache headers
  const headers = {
    'Cache-Control': 'no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache'
  }
  try {
    const user = await currentUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ activeSessions: [] }), { 
        status: 401,
        headers 
      })
    }

    // Get all active sessions
    const activeSessions = await db.liveSession.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({ activeSessions }, { headers })
  } catch (error) {
    console.error("[ACTIVE_SESSIONS]", error)
    return new NextResponse(JSON.stringify({ error: "Internal error" }), { 
      status: 500,
      headers 
    })
  }
}
