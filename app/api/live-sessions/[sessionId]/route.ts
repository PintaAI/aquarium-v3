import { NextRequest, NextResponse } from "next/server"
import { RoomServiceClient } from "livekit-server-sdk"
import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"

const livekitHost = process.env.NEXT_PUBLIC_LIVEKIT_URL
const apiKey = process.env.LIVEKIT_API_KEY
const apiSecret = process.env.LIVEKIT_API_SECRET

if (!livekitHost || !apiKey || !apiSecret) {
  throw new Error("LiveKit configuration missing")
}

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret)

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await currentUser()
    const { sessionId } = (await context.params)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await db.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("[GET_SESSION_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await currentUser()
    const { sessionId } = (await context.params)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await db.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        creator: {
          select: {
            id: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Check if the user is the creator or admin
    if (session.creator.id !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized to delete this session" },
        { status: 403 }
      )
    }

    try {
      // First, close the LiveKit room to disconnect all participants
      await roomService.deleteRoom(sessionId)
    } catch (error) {
      console.error("[LIVEKIT_DELETE_ROOM_ERROR]", error)
      // Continue with database deletion even if LiveKit room deletion fails
    }

    // Then delete the session from the database
    await db.liveSession.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE_SESSION_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    )
  }
}
