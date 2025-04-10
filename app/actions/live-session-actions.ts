'use server'

import { db } from '@/lib/db'
import { currentUser } from '@/lib/auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const createSessionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  scheduledStart: z.coerce.date(),
  scheduledEnd: z.coerce.date().optional(),
  courseId: z.coerce.number()
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>

export interface LiveSession {
  id: string
  name: string
  description: string | null
  streamCallId: string | null
  status: 'SCHEDULED' | 'LIVE' | 'ENDED'
  scheduledStart: Date
  scheduledEnd: Date | null
  actualStart: Date | null
  actualEnd: Date | null
  recordingUrl: string | null
  createdAt: Date
  updatedAt: Date
  courseId: number
  course: {
    id: number
    title: string
  }
  creator: {
    id: string
    name: string | null
    image: string | null
  }
  participants: Array<{
    id: string
    name: string | null
    image: string | null
  }>
}

export async function createLiveSession(data: CreateSessionInput) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    const validatedData = createSessionSchema.parse(data)

    const liveSession = await db.liveSession.create({
      data: {
        ...validatedData,
        creatorId: user.id,
        status: 'SCHEDULED'
      }
    })

    return { success: true, sessionId: liveSession.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Failed to create live session:', error)
    return { success: false, error: 'Failed to create live session' }
  }
}

export async function startLiveSession(sessionId: string) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    const session = await db.liveSession.findUnique({
      where: { id: sessionId, creatorId: user.id },
    })

    if (!session) {
      throw new Error('Session not found or unauthorized')
    }

    if (session.status === 'LIVE') {
      throw new Error('Session is already live')
    }

    const updatedSession = await db.liveSession.update({
      where: { id: sessionId },
      data: {
        status: 'LIVE',
        actualStart: new Date(),
        streamCallId: `live_${sessionId}` // Will be used by Stream SDK
      }
    })

    return { success: true, sessionId: updatedSession.id, streamCallId: updatedSession.streamCallId }
  } catch (error) {
    console.error('Failed to start live session:', error)
    return { success: false, error: 'Failed to start live session' }
  }
}

export async function getLiveSession(sessionId: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return null
    }

    const session = await db.liveSession.findUnique({
      where: {
        id: sessionId
      },
      select: {
        id: true,
        name: true,
        description: true,
        streamCallId: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
        actualStart: true,
        actualEnd: true,
        recordingUrl: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        course: {
          select: {
            id: true,
            title: true,
          }
        },
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
      }
    })

    return session as LiveSession | null
  } catch (error) {
    console.error("Failed to fetch live session:", error)
    return null
  }
}

export async function getLiveSessions() {
  try {
    const user = await currentUser()
    if (!user) {
      return { active: [], scheduled: [] }
    }

    // Keep track of current user ID for role checks
    const isCurrentUser = (sessionCreatorId: string) => sessionCreatorId === user.id

    const now = new Date()

    // Remove all where conditions to fetch all sessions
    const sessions = await db.liveSession.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        streamCallId: true,
        status: true,
        scheduledStart: true,
        scheduledEnd: true,
        actualStart: true,
        actualEnd: true,
        recordingUrl: true,
        createdAt: true,
        updatedAt: true,
        courseId: true,
        course: {
          select: {
            id: true,
            title: true,
          }
        },
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
        scheduledStart: 'asc'
      }
    })

    // Split into active and scheduled sessions
    const active = sessions.filter(session => 
      session.status === 'LIVE' && // Session is live
      !session.actualEnd && // Session hasn't ended
      (session.actualStart || // Has actually started
       (session.scheduledStart <= now && (!session.scheduledEnd || session.scheduledEnd > now))) // Or within scheduled time
    )
    
    const scheduled = sessions.filter(session => 
      session.status === 'SCHEDULED' && // Only scheduled sessions
      (!session.actualEnd || session.actualEnd > now) && // Not ended
      (!session.scheduledEnd || session.scheduledEnd > now) // Not past scheduled end
    )

    return {
      active: active.map(session => ({
        ...session,
        isCurrentUserCreator: isCurrentUser(session.creator.id)
      })),
      scheduled: scheduled.map(session => ({
        ...session,
        isCurrentUserCreator: isCurrentUser(session.creator.id)
      }))
    }

  } catch (error) {
    console.error("Failed to fetch live sessions:", error)
    return { active: [], scheduled: [] }
  }
}

export async function deleteLiveSession(sessionId: string) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    // Verify the user is the creator of the session
    const session = await db.liveSession.findUnique({
      where: { id: sessionId, creatorId: user.id },
      select: { id: true } // Only need the ID for verification
    })

    if (!session) {
      throw new Error('Session not found or user is not the creator')
    }

    // TODO: Add logic here to potentially stop the stream via Stream SDK if it's active
    // before deleting the database record. This depends on the Stream SDK's capabilities.
    // Example: await stopStream(session.streamCallId);

    // Delete the session
    await db.liveSession.delete({
      where: { id: sessionId }
    })

    // Revalidate the path to update the UI
    revalidatePath('/dashboard/live-session')
    // Also revalidate the specific session page in case someone is viewing it
    revalidatePath(`/dashboard/live-session/${sessionId}`) 

    return { success: true }
  } catch (error) {
    console.error('Failed to delete live session:', error)
    // Check if error is an instance of Error to access message property safely
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete live session'
    return { success: false, error: errorMessage }
  }
}
