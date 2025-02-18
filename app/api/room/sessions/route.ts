import { getActiveLiveKitRooms } from "@/lib/livekit"
import { currentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rooms = await getActiveLiveKitRooms()
    
    return Response.json({
      rooms: rooms.map(room => ({
        name: room.name,
        numParticipants: room.numParticipants,
        creationTime: Number(room.creationTime)  // Convert BigInt to number
      }))
    })

  } catch (error) {
    console.error("[LIVEKIT_SESSIONS_GET]", error)
    return Response.json(
      { error: "Failed to get sessions" }, 
      { status: 500 }
    )
  }
}
