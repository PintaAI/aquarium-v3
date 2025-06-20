'use server'

import { db } from '@/lib/db'
import { currentUser } from '@/lib/auth'

export async function endLiveSession(sessionId: string) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    // Update the live session status to ENDED and set actualEnd time
    const updatedSession = await db.liveSession.update({
      where: { 
        id: sessionId,
        creatorId: user.id // Ensure only the creator can end the session
      },
      data: {
        status: 'ENDED',
        actualEnd: new Date()
      }
    })

    return { success: true, sessionId: updatedSession.id }
  } catch (error) {
    console.error('Failed to end live session:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to end live session' 
    }
  }
}
