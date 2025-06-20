'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { currentUser } from '@/lib/auth'
import { auth } from '@/auth'
import { addCourseSchema, updateCourseSchema } from '@/schemas/course'
import { getEventStatus, shouldCourseBeLocked, CourseWithEventInfo } from '@/lib/course-utils'
import { z } from 'zod'

export interface Course {
  id: number
  title: string
  description: string | null
  jsonDescription: string | null
  htmlDescription: string | null
  level: string
  type: string
  eventStartDate: Date | null
  eventEndDate: Date | null
  thumbnail: string | null
  isLocked: boolean
  modules: Array<{
    id: number
    title: string
    description?: string
    order: number
    completions: Array<{
      isCompleted: boolean
    }>
  }>
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string | null
    image: string | null
  }
  members?: Array<{
    id: string
  }>,
  price?: number | null,
  paidCourseMessage?: string | null,
  liveSessions?: Array<{
    id: string
    name: string
    description: string | null
    recordingUrl: string | null
    actualStart: Date | null
    actualEnd: Date | null
    createdAt: Date
    creator: {
      id: string
      name: string | null
      image: string | null
    }
  }>
}

export async function getJoinedCourses() {
  try {
    const user = await currentUser();
    if (!user) {
      return [];
    }

    const courses = await db.course.findMany({
      where: {
        members: {
          some: {
            id: user.id
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        jsonDescription: true,
        htmlDescription: true,
        level: true,
        type: true,
        eventStartDate: true,
        eventEndDate: true,
        thumbnail: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            completions: {
              where: {
                userId: user.id,
                isCompleted: true
              },
              select: {
                isCompleted: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        price: true,
        paidCourseMessage: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return courses as Course[];
  } catch (error) {
    console.error("Failed to fetch joined courses:", error);
    return [];
  }
}

export async function addCourse(data: z.infer<typeof addCourseSchema>) {
  try {
    const validatedData = addCourseSchema.parse(data)
    const user = await currentUser()

    if (!user || user.role !== 'GURU') {
      throw new Error('Unauthorized')
    }

    const course = await db.course.create({
      data: {
        ...validatedData,
        authorId: user.id,
      },
    })

    revalidatePath('/courses')
    return { success: true, courseId: course.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Failed to add course:', error)
    return { success: false, error: 'Failed to add course' }
  }
}

export async function updateCourse(courseId: number, data: z.infer<typeof updateCourseSchema>) {
  try {
    const validatedData = updateCourseSchema.parse(data)
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: validatedData,
    })

    revalidatePath(`/courses/${courseId}`)
    return { success: true, courseId: updatedCourse.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Failed to update course:', error)
    return { success: false, error: 'Failed to update course' }
  }
}

export async function deleteCourse(courseId: number) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        authorId: session.user.id,
      },
    })

    if (!course) {
      throw new Error("Unauthorized")
    }

    await db.$transaction([
      db.module.deleteMany({
        where: {
          courseId,
        },
      }),
      db.course.delete({
        where: {
          id: courseId,
        },
      }),
    ])

    revalidatePath('/courses')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete course:', error)
    return { success: false, error: 'Failed to delete course' }
  }
}

export async function getCourse(courseId: number) {
  try {
    console.log('Fetching course data...')
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        jsonDescription: true,
        htmlDescription: true,
        level: true,
        type: true,
        eventStartDate: true,
        eventEndDate: true,
        thumbnail: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            completions: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        members: true,
        price: true,
        paidCourseMessage: true,
        liveSessions: {
          where: {
            recordingUrl: {
              not: null
            }
          },
          select: {
            id: true,
            name: true,
            description: true,
            recordingUrl: true,
            actualStart: true,
            actualEnd: true,
            createdAt: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            actualStart: 'desc'
          }
        }
      }
    })

    if (!course) {
      console.log('Course not found')
      return null
    }

    console.log('Course data retrieved successfully')
    return course as Course
  } catch (error) {
    console.error('Error fetching course data')
    throw error
  }
}

export async function getLatestJoinedCourses(): Promise<Course[]> {
  try {
    const user = await currentUser();
    if (!user) {
      return [];
    }

    const courses = await db.course.findMany({
      where: {
        members: {
          some: {
            id: user.id
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        jsonDescription: true,
        htmlDescription: true,
        level: true,
        type: true,
        eventStartDate: true,
        eventEndDate: true,
        thumbnail: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            completions: {
              where: {
                userId: user.id,
                isCompleted: true
              },
              select: {
                isCompleted: true
              }
            }
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 3
    });

    return courses as Course[];
  } catch (error) {
    console.error("Failed to fetch latest joined courses:", error);
    return [];
  }
}

export async function getCourses(): Promise<Course[]> {
  try {
    const user = await currentUser();
    const courses = await db.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        jsonDescription: true,
        htmlDescription: true,
        level: true,
        type: true,
        eventStartDate: true,
        eventEndDate: true,
        thumbnail: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            completions: user ? {
              where: {
                userId: user.id,
                isCompleted: true
              },
              select: {
                isCompleted: true
              }
            } : undefined
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        members: {
          select: {
            id: true
          }
        },
        price: true,
        paidCourseMessage: true
      }
    })
    return courses as Course[]
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    throw new Error("Failed to fetch courses")
  }
}

export async function getCourseWithModules(courseId: number) {
  try {
    const user = await currentUser();
    console.log('Fetching course modules...')
    const courseData = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        jsonDescription: true,
        htmlDescription: true,
        level: true,
        type: true,
        eventStartDate: true,
        eventEndDate: true,
        thumbnail: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
            completions: user ? {
              where: {
                userId: user.id,
                isCompleted: true
              },
              select: {
                isCompleted: true
              }
            } : undefined
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    if (!courseData) {
      console.log('Course not found')
      return null
    }

    console.log('Course modules retrieved successfully')
    return courseData as Course
  } catch (error) {
    console.error('Error fetching course modules')
    throw error
  }
}

export async function startCourse(courseId: number) {
  const user = await currentUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { modules: { orderBy: { order: 'asc' } } },
    })

    if (!course) {
      throw new Error("Course not found")
    }

    await db.course.update({
      where: { id: courseId },
      data: {
        members: {
          connect: { id: user.id }
        }
      }
    })

    return { success: true, nextModuleId: course.modules[0]?.id }
  } catch (error) {
    console.error(`Failed to start course ${courseId}:`, error)
    throw error
  }
}

/**
 * Cleanup expired event courses by clearing members and locking them
 */
export async function cleanupExpiredEventCourses() {
  try {
    const now = new Date()
    
    // Find all expired event courses that still have members
    const expiredEventCourses = await db.course.findMany({
      where: {
        type: 'EVENT',
        eventEndDate: {
          lt: now
        },
        members: {
          some: {}
        }
      },
      include: {
        members: true
      }
    })

    if (expiredEventCourses.length === 0) {
      console.log('No expired event courses found')
      return { success: true, cleanedCount: 0 }
    }

    // Clear members from expired courses and lock them
    const cleanupPromises = expiredEventCourses.map(async (course) => {
      return db.course.update({
        where: { id: course.id },
        data: {
          isLocked: true,
          members: {
            set: [] // Remove all members
          }
        }
      })
    })

    await Promise.all(cleanupPromises)

    console.log(`Cleaned up ${expiredEventCourses.length} expired event courses`)
    return { success: true, cleanedCount: expiredEventCourses.length }
  } catch (error) {
    console.error('Failed to cleanup expired event courses:', error)
    return { success: false, error: 'Failed to cleanup expired courses' }
  }
}

/**
 * Get event course status and check if user can access
 */
export async function getEventCourseAccess(courseId: number, userId?: string) {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        type: true,
        eventStartDate: true,
        eventEndDate: true,
        isLocked: true,
        members: {
          where: userId ? { id: userId } : undefined,
          select: { id: true }
        }
      }
    })

    if (!course) {
      return { success: false, error: 'Course not found' }
    }

    const eventStatus = getEventStatus(course as CourseWithEventInfo)
    const shouldBeLocked = shouldCourseBeLocked(course as CourseWithEventInfo)
    const isMember = userId ? course.members.length > 0 : false

    return {
      success: true,
      eventStatus,
      shouldBeLocked,
      isMember,
      canAccess: isMember && !shouldBeLocked
    }
  } catch (error) {
    console.error('Failed to get event course access:', error)
    return { success: false, error: 'Failed to check course access' }
  }
}
