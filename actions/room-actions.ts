"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { currentUser } from "@/lib/auth"

interface CreateRoomParams {
  name: string
  description?: string
  courseId: number
}

interface JoinRoomParams {
  roomId: string
}

export async function createRoom(params: CreateRoomParams) {
  try {
    const user = await currentUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (user.role !== "GURU") {
      throw new Error("Only GURU can create rooms")
    }

    const room = await db.room.create({
      data: {
        name: params.name,
        description: params.description,
        courseId: params.courseId,
        creatorId: user.id,
        participants: {
          connect: {
            id: user.id
          }
        }
      }
    })

    revalidatePath("/room")
    return room

  } catch (error) {
    console.error("[ROOM_CREATE]", error)
    throw error
  }
}

export async function joinRoom({ roomId }: JoinRoomParams) {
  try {
    const user = await currentUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    const room = await db.room.update({
      where: {
        id: roomId,
        isActive: true
      },
      data: {
        participants: {
          connect: {
            id: user.id
          }
        }
      }
    })

    revalidatePath("/room")
    return room

  } catch (error) {
    console.error("[ROOM_JOIN]", error)
    throw error
  }
}

export async function getLiveSessions() {
  try {
    const user = await currentUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rooms = await db.room.findMany({
      where: {
        isActive: true
      },
      include: {
        creator: true,
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    })

    return rooms

  } catch (error) {
    console.error("[LIVE_SESSIONS_GET]", error)
    throw error
  }
}

export async function getRooms() {
  try {
    const user = await currentUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rooms = await db.room.findMany({
      where: {
        isActive: true
      },
      include: {
        creator: true,
        course: true,
        participants: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return rooms

  } catch (error) {
    console.error("[ROOMS_GET]", error)
    throw error
  }
}

export async function getRoomById(roomId: string) {
  try {
    const room = await db.room.findUnique({
      where: {
        id: roomId,
        isActive: true
      },
      include: {
        creator: true,
        course: true,
        participants: true
      }
    })

    return room

  } catch (error) {
    console.error("[ROOM_GET]", error)
    throw error
  }
}

export async function endRoom(roomId: string) {
  try {
    const user = await currentUser()
    
    if (!user) {
      throw new Error("Unauthorized")
    }

    const room = await db.room.findUnique({
      where: {
        id: roomId
      }
    })

    if (!room) {
      throw new Error("Room not found")
    }

    if (room.creatorId !== user.id) {
      throw new Error("Only creator can end room")
    }

    await db.room.update({
      where: {
        id: roomId
      },
      data: {
        isActive: false
      }
    })

    revalidatePath("/room")
    return room

  } catch (error) {
    console.error("[ROOM_END]", error)
    throw error
  }
}
