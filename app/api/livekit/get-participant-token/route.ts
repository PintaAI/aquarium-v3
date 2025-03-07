import { AccessToken } from "livekit-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const roomId = searchParams.get("roomId")
    const userName = searchParams.get("userName")

    if (!roomId || !userName) {
      return NextResponse.json(
        { error: "Missing roomId or userName" },
        { status: 400 }
      )
    }

    // Verify user has access to the session
    const session = await db.liveSession.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          where: { id: user.id },
          select: { id: true }
        }
      }
    })

    if (!session) {
      console.log(`[LiveKit] Session not found: ${roomId}`)
      return NextResponse.json(
        { error: "Live session not found" },
        { status: 404 }
      )
    }

    const isParticipant = session.participants.length > 0
    const isCreator = session.creatorId === user.id

    console.log(`[LiveKit] Access check - isActive: ${session.isActive}, isParticipant: ${isParticipant}, isCreator: ${isCreator}, userId: ${user.id}, creatorId: ${session.creatorId}`)
    
    // For now, allow access even if session is not active for testing
    if ((!isParticipant && !isCreator)) {
      return NextResponse.json(
        { error: "Access denied to this live session" },
        { status: 403 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit configuration missing" },
        { status: 500 }
      )
    }

    // Create access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: userName
    })

    // Add grants
    at.addGrant({
      room: roomId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    })

    // Generate token
    const token = at.toJwt()
    return NextResponse.json({ token })
  } catch (error) {
    console.error("[LiveKit Token Error]", error)
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("[LiveKit Token Error Details]", error.message, error.stack)
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
