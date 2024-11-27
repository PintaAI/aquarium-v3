'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { currentUser } from '@/lib/auth'
import { auth } from '@/auth'
import { addCourseSchema, updateCourseSchema } from '@/schemas/course'
import { z } from 'zod'

export interface Course {
  id: number
  title: string
  description: string | null
  level: string
  thumbnail: string | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

// Fungsi untuk mendapatkan kursus yang diikuti user
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
        thumbnail: true,
        modules: {
          select: {
            id: true,
            title: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return courses;
  } catch (error) {
    console.error("Failed to fetch joined courses:", error);
    return [];
  }
}

export async function addCourse(data: z.infer<typeof addCourseSchema>) {
  try {
    // Validate input data
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
    // Validate input data
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

    // Verify user owns the course
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        authorId: session.user.id,
      },
    })

    if (!course) {
      throw new Error("Unauthorized")
    }

    // Delete course and its modules in a transaction
    await db.$transaction([
      // First delete all modules
      db.module.deleteMany({
        where: {
          courseId,
        },
      }),
      // Then delete the course
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
      include: {
        author: true,
        modules: true,
        members: true,
      },
    })

    if (!course) {
      console.log('Course not found')
      return null
    }

    console.log('Course data retrieved successfully')
    return course
  } catch (error) {
    console.error('Error fetching course data')
    throw error
  }
}

export async function getCourses(): Promise<Course[]> {
  try {
    const courses = await db.course.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })
    return courses as Course[]
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    throw new Error("Failed to fetch courses")
  }
}

export async function getCourseWithModules(courseId: number) {
  try {
    console.log('Fetching course modules...')
    const courseData = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          select: {
            id: true,
            title: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!courseData) {
      console.log('Course not found')
      return null
    }

    console.log('Course modules retrieved successfully')
    return courseData
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

    // Add user to course members
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
