'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { currentUser } from '@/lib/auth'
import { z } from 'zod'
import { getEventStatus } from '@/lib/course-utils'
import { CourseType } from '@prisma/client'

// Schema for request join course
const requestJoinSchema = z.object({
  courseId: z.number(),
  message: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
  contact: z.string().optional()
})

// Schema for handling join request (approve/reject)
const _handleJoinRequestSchema = z.object({
  requestId: z.number(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional()
})

// Submit a join request for a course
export async function requestJoinCourse(data: z.infer<typeof requestJoinSchema>) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validatedData = requestJoinSchema.parse(data)
    const { courseId, message, attachmentUrl, contact } = validatedData

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        author: { select: { id: true } },
        members: { where: { id: user.id } }
      }
    })

    if (!course) {
      return { success: false, error: 'Course not found' }
    }

    // Check if user is course author
    if (course.author.id === user.id) {
      return { success: false, error: 'Cannot request to join your own course' }
    }

    // Check if user is already a member
    if (course.members.length > 0) {
      return { success: false, error: 'You are already a member of this course' }
    }

    // Check if user already has a pending or approved request
    const existingRequest = await db.courseJoinRequest.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: user.id
        }
      }
    })

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return { success: false, error: 'You already have a pending request for this course' }
      }
      if (existingRequest.status === 'APPROVED') {
        return { success: false, error: 'Your request has already been approved' }
      }
      // If rejected, allow to request again by updating existing request
      await db.courseJoinRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'PENDING',
          message: message || null,
          attachmentUrl: attachmentUrl || null,
          contact: contact || null,
          reason: null,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new request
      await db.courseJoinRequest.create({
        data: {
          courseId,
          userId: user.id,
          message: message || null,
          attachmentUrl: attachmentUrl || null,
          contact: contact || null,
          status: 'PENDING'
        }
      })
    }

    revalidatePath(`/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to request join course:', error)
    return { success: false, error: 'Failed to submit join request' }
  }
}

// Approve a join request
export async function approveJoinRequest(requestId: number) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      return { success: false, error: 'Unauthorized' }
    }

    // Get the request with course info
    const request = await db.courseJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        course: {
          select: { 
            id: true, 
            authorId: true,
            type: true,
            eventStartDate: true,
            eventEndDate: true,
            isLocked: true, // Add isLocked to check overall lock status
            members: { where: { id: { equals: undefined } } } // Get all members
          }
        },
        user: { select: { id: true } }
      }
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    // All GURU users can approve any join request (removed author check)

    // Check if request is still pending
    if (request.status !== 'PENDING') {
      return { success: false, error: 'Request has already been processed' }
    }

    // For event courses, check if the event is still active
    if (request.course.type === CourseType.EVENT) {
      const eventStatus = getEventStatus(request.course);
      if (eventStatus === 'expired') {
        // Optionally, auto-reject the request or inform the teacher
        // For now, let's prevent approval of requests for expired events
        return { success: false, error: 'Cannot approve request for an expired event course.' };
      }
      if (eventStatus === 'upcoming') {
        // Optionally, allow approval but user won't get access until event starts
        // Or prevent approval until event starts
        // For now, let's allow approval for upcoming events
      }
    }
    
    // Check if user is already a member (race condition check)
    const isMember = await db.course.findFirst({
      where: {
        id: request.courseId,
        members: {
          some: { id: request.userId }
        }
      }
    })

    if (isMember) {
      // Update request status to approved but don't add to members again
      await db.courseJoinRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      })
      return { success: false, error: 'User is already a member of this course' }
    }

    // Use transaction to approve request and add user to course
    await db.$transaction([
      // Update request status
      db.courseJoinRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      }),
      // Add user to course members
      db.course.update({
        where: { id: request.courseId },
        data: {
          members: {
            connect: { id: request.userId }
          }
        }
      })
    ])

    revalidatePath(`/courses/${request.courseId}`)
    revalidatePath('/dashboard/course-requests')
    return { success: true }
  } catch (error) {
    console.error('Failed to approve join request:', error)
    return { success: false, error: 'Failed to approve request' }
  }
}

// Reject a join request
export async function rejectJoinRequest(requestId: number, reason?: string) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      return { success: false, error: 'Unauthorized' }
    }

    // Get the request with course info
    const request = await db.courseJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        course: { select: { id: true, authorId: true } }
      }
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    // All GURU users can reject any join request (removed author check)

    // Check if request is still pending
    if (request.status !== 'PENDING') {
      return { success: false, error: 'Request has already been processed' }
    }

    // Update request status to rejected
    await db.courseJoinRequest.update({
      where: { id: requestId },
      data: { 
        status: 'REJECTED',
        reason: reason || null
      }
    })

    revalidatePath(`/courses/${request.courseId}`)
    revalidatePath('/dashboard/course-requests')
    return { success: true }
  } catch (error) {
    console.error('Failed to reject join request:', error)
    return { success: false, error: 'Failed to reject request' }
  }
}

// Get join requests for a specific course (accessible by all GURU users)
export async function getJoinRequests(courseId: number) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      return { success: false, error: 'Unauthorized' }
    }

    // All GURU users can access join requests for any course
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return { success: false, error: 'Course not found' }
    }

    const requests = await db.courseJoinRequest.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, requests }
  } catch (error) {
    console.error('Failed to get join requests:', error)
    return { success: false, error: 'Failed to get requests' }
  }
}

// Get all join requests for all courses (accessible by all GURU users)
export async function getAllJoinRequests() {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      return { success: false, error: 'Unauthorized' }
    }

    const requests = await db.courseJoinRequest.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
    })

    return { success: true, requests }
  } catch (error) {
    console.error('Failed to get all join requests:', error)
    return { success: false, error: 'Failed to get requests' }
  }
}

// Get user's join request status for a course
export async function getUserJoinRequestStatus(courseId: number) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const request = await db.courseJoinRequest.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: user.id
        }
      },
      select: {
        id: true,
        status: true,
        message: true,
        reason: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return { success: true, request }
  } catch (error) {
    console.error('Failed to get join request status:', error)
    return { success: false, error: 'Failed to get request status' }
  }
}

// Revoke an approved join request (remove user from course and change status to rejected)
export async function revokeJoinRequest(requestId: number, reason?: string) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      return { success: false, error: 'Unauthorized' }
    }

    // Get the request with course info
    const request = await db.courseJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        course: { select: { id: true, authorId: true } }
      }
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    // All GURU users can revoke any approved join request (removed author check)

    // Can only revoke approved requests
    if (request.status !== 'APPROVED') {
      return { success: false, error: 'Can only revoke approved requests' }
    }

    // Use transaction to update request status and remove user from course
    await db.$transaction([
      // Update request status to rejected
      db.courseJoinRequest.update({
        where: { id: requestId },
        data: { 
          status: 'REJECTED',
          reason: reason || 'Approval revoked'
        }
      }),
      // Remove user from course members
      db.course.update({
        where: { id: request.courseId },
        data: {
          members: {
            disconnect: { id: request.userId }
          }
        }
      })
    ])

    // Comprehensive cache invalidation
    revalidatePath(`/courses/${request.courseId}`)
    revalidatePath('/courses')
    revalidatePath('/dashboard/course-requests')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to revoke join request:', error)
    return { success: false, error: 'Failed to revoke request' }
  }
}

// Cancel a pending join request
export async function cancelJoinRequest(requestId: number) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get the request and verify ownership
    const request = await db.courseJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        course: { select: { id: true } }
      }
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    // Verify user owns the request
    if (request.userId !== user.id) {
      return { success: false, error: 'Unauthorized - not your request' }
    }

    // Can only cancel pending requests
    if (request.status !== 'PENDING') {
      return { success: false, error: 'Can only cancel pending requests' }
    }

    // Delete the request
    await db.courseJoinRequest.delete({
      where: { id: requestId }
    })

    revalidatePath(`/courses/${request.courseId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to cancel join request:', error)
    return { success: false, error: 'Failed to cancel request' }
  }
}

// Delete a join request (admin function - for GURU to delete any request)
export async function deleteJoinRequest(requestId: number) {
  try {
    const user = await currentUser()
    if (!user || user.role !== 'GURU') {
      return { success: false, error: 'Unauthorized' }
    }

    // Get the request
    const request = await db.courseJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        course: { select: { id: true } }
      }
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    // Delete the request
    await db.courseJoinRequest.delete({
      where: { id: requestId }
    })

    revalidatePath(`/courses/${request.courseId}`)
    revalidatePath('/dashboard/course-requests')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete join request:', error)
    return { success: false, error: 'Failed to delete request' }
  }
}
