import { Room, RoomServiceClient } from "livekit-server-sdk"

const livekitHost = process.env.NEXT_PUBLIC_LIVEKIT_URL
const apiKey = process.env.LIVEKIT_API_KEY
const apiSecret = process.env.LIVEKIT_API_SECRET

if (!livekitHost || !apiKey || !apiSecret) {
  throw new Error("LiveKit configuration missing")
}

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret)

export async function getActiveLiveKitRooms(): Promise<Room[]> {
  const rooms = await roomService.listRooms()
  return rooms.filter((room: Room) => room.numParticipants > 0)
}

export async function getLiveKitRoom(roomName: string): Promise<Room | undefined> {
  const rooms = await roomService.listRooms()
  return rooms.find((room: Room) => room.name === roomName)
}
