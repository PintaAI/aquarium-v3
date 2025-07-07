'use server'

import { db } from '@/lib/db'
import { currentUser } from '@/lib/auth'

export async function saveRecordingUrl(sessionId: string, recordingUrl: string) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    // Update the live session with the recording URL
    const updatedSession = await db.liveSession.update({
      where: { 
        id: sessionId,
        creatorId: user.id // Ensure only the creator can update
      },
      data: {
        recordingUrl: recordingUrl
      }
    })

    return { success: true, sessionId: updatedSession.id }
  } catch (error) {
    console.error('Failed to save recording URL:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save recording URL' 
    }
  }
}

export async function getSessionRecordings(sessionId: string) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const session = await db.liveSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        recordingUrl: true,
        creator: {
          select: {
            id: true
          }
        },
        course: {
          select: {
            members: {
              where: { id: user.id },
              select: { id: true }
            }
          }
        }
      }
    })

    if (!session) {
      throw new Error('Session not found')
    }

    // Check if user is creator or member of the course
    const isCreator = session.creator.id === user.id
    const isMember = session.course.members.length > 0

    if (!isCreator && !isMember) {
      throw new Error('Access denied')
    }

    return { 
      success: true, 
      recordingUrl: session.recordingUrl,
      isCreator
    }
  } catch (error) {
    console.error('Failed to get session recordings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get recordings' 
    }
  }
}

export async function deleteRecording(sessionId: string) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    // Update the live session to remove the recording URL
    const updatedSession = await db.liveSession.update({
      where: { 
        id: sessionId
      },
      data: {
        recordingUrl: null
      }
    })

    return { success: true, sessionId: updatedSession.id }
  } catch (error) {
    console.error('Failed to delete recording:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete recording' 
    }
  }
}
