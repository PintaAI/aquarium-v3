"use server"

import { currentUser as getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Room, RoomServiceClient, AccessToken } from "livekit-server-sdk"

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

export async function generateToken(roomName: string, participantName: string, participantId: string): Promise<string> {
  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit configuration missing")
  }

  // Create access token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName
  })

  // Add grants
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true
  })

  // Generate token
  return at.toJwt()
}

export async function createLiveSession(courseId: number, data: {
  name: string
  description?: string
  scheduledStart: Date
  scheduledEnd?: Date
}) {
  const user = await getCurrentUser()

  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    throw new Error("Only teachers and admins can create live sessions")
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { author: true }
  })

  if (!course) {
    throw new Error("Course not found")
  }

  const liveSession = await db.liveSession.create({
    data: {
      ...data,
      creatorId: user.id,
      courseId: courseId,
      isActive: false,
    }
  })

  revalidatePath("/dashboard/live-session")
  revalidatePath(`/courses/${courseId}`)

  return liveSession
}

export async function getLiveSessionWithAccess(sessionId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const session = await db.liveSession.findUnique({
    where: { 
      id: sessionId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true
        }
      },
      course: {
        select: {
          id: true,
          title: true
        }
      },
      participants: {
        where: {
          id: user.id
        },
        select: {
          id: true
        }
      }
    }
  })

  if (!session) {
    throw new Error("Live session not found")
  }

  const isParticipant = session.participants.length > 0
  const isCreator = session.creator.id === user.id
  const isAdmin = user.role === "ADMIN"

  // Allow access for participants, creators, and admins
  if (!isParticipant && !isCreator && !isAdmin) {
    // For debugging purposes
    console.log(`Access denied - User: ${user.id}, Creator: ${session.creator.id}, isAdmin: ${isAdmin}, isParticipant: ${isParticipant}`)
    throw new Error("Access denied to this live session")
  }

  return session
}

export async function listUserLiveSessions() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return db.liveSession.findMany({
    where: {
      OR: [
        { creatorId: user.id },
        {
          participants: {
            some: { id: user.id }
          }
        }
      ]
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      participants: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    },
    orderBy: {
      scheduledStart: "desc"
    }
  })
}

export async function listCourseLiveSessions(courseId: number) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return db.liveSession.findMany({
    where: {
      courseId: courseId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      participants: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    },
    orderBy: {
      scheduledStart: "desc"
    }
  })
}

export async function joinLiveSession(liveSessionId: string) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // First check if session exists and user isn't already a participant
  const session = await db.liveSession.findUnique({
    where: { id: liveSessionId },
    include: {
      participants: {
        where: { id: user.id },
        select: { id: true }
      },
      course: true,
      creator: {
        select: { id: true }
      }
    }
  })

  if (!session) {
    throw new Error("Live session not found")
  }

  // Don't allow creator to join as participant
  if (session.creator.id === user.id) {
    console.log(`Creator ${user.id} attempting to join their own session ${liveSessionId}`)
    // Return success - creators don't need to join, they already have access
    return session;
  }

  // Don't allow admins to join as participants - they already have access
  if (user.role === "ADMIN") {
    console.log(`Admin ${user.id} attempting to join session ${liveSessionId}`)
    // Return success - admins don't need to join, they already have access
    return session;
  }

  // Check if user is already a participant
  if (session.participants.length > 0) {
    console.log(`User ${user.id} already joined session ${liveSessionId}`)
    // Return success - they're already part of the session
    return session;
  }

  console.log(`User ${user.id} joining session ${liveSessionId}`)
  
  // Join the session
  const liveSession = await db.liveSession.update({
    where: { id: liveSessionId },
    data: {
      participants: {
        connect: { id: user.id }
      }
    },
    include: {
      course: true
    }
  })

  return liveSession
}

export async function startLiveSession(liveSessionId: string) {
  const user = await getCurrentUser()

  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    throw new Error("Only teachers and admins can start live sessions")
  }

  const liveSession = await db.liveSession.findUnique({
    where: { id: liveSessionId },
    include: {
      creator: {
        select: {
          name: true
        }
      },
      course: {
        select: {
          title: true
        }
      }
    }
  })

  if (!liveSession || (liveSession.creatorId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Unauthorized to start this live session")
  }

  const updatedSession = await db.liveSession.update({
    where: { id: liveSessionId },
    data: {
      isActive: true,
      actualStart: new Date()
    }
  })

  // Send push notification to all users
  try {
    const teacherName = liveSession.creator.name || 'Teacher'
    const courseName = liveSession.course.title
    
    await import('@/app/actions/push-notifications').then(({ sendNotification }) => {
      return sendNotification(
        'all',
        'Live Session Started',
        {
          body: `${teacherName} has started a live session for "${courseName}". Join now!`,
          url: `/dashboard/live-session/${liveSessionId}`
        }
      )
    })
  } catch (error) {
    // Log error but don't fail the session start
    console.error('Failed to send push notification:', error)
  }

  return updatedSession
}

export async function deleteLiveSession(liveSessionId: string) {
  const user = await getCurrentUser()

  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    throw new Error("Only teachers and admins can delete live sessions")
  }

  const liveSession = await db.liveSession.findUnique({
    where: { id: liveSessionId }
  })

  if (!liveSession || (liveSession.creatorId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Unauthorized to delete this live session")
  }

  try {
    // First delete the LiveKit room to disconnect all participants
    await roomService.deleteRoom(liveSessionId)

    // Then delete the live session from the database
    const result = await db.liveSession.delete({
      where: { id: liveSessionId }
    })

    return { success: true, courseId: result.courseId }
  } catch (error) {
    console.error("[DELETE_SESSION_ERROR]", error)
    throw new Error("Failed to delete session and disconnect participants")
  }
}

export async function endLiveSession(liveSessionId: string) {
  const user = await getCurrentUser()

  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    throw new Error("Only teachers and admins can end live sessions")
  }

  const liveSession = await db.liveSession.findUnique({
    where: { id: liveSessionId }
  })

  if (!liveSession || (liveSession.creatorId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Unauthorized to end this live session")
  }

  const updatedSession = await db.liveSession.update({
    where: { id: liveSessionId },
    data: {
      isActive: false,
      actualEnd: new Date()
    }
  })

  revalidatePath("/dashboard/live-session")
  revalidatePath(`/courses/${liveSession.courseId}`)

  return updatedSession
}
