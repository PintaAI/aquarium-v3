"use server"

import { db } from "@/lib/db"
import type { Course, User } from "@prisma/client"

export type CourseWithAuthor = Course & {
  author: Pick<User, "name" | "image">
}

export async function getCourses(): Promise<CourseWithAuthor[]> {
  try {
    const courses = await db.course.findMany({
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return courses
  } catch (error) {
    console.error("[COURSES_GET]", error)
    throw new Error("Failed to fetch courses")
  }
}

export async function getCourseById(id: number): Promise<CourseWithAuthor | null> {
  try {
    const course = await db.course.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    return course
  } catch (error) {
    console.error("[COURSE_GET]", error)
    throw new Error("Failed to fetch course")
  }
}

export async function getCoursesByAuthorId(authorId: string): Promise<CourseWithAuthor[]> {
  try {
    const courses = await db.course.findMany({
      where: { authorId },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return courses
  } catch (error) {
    console.error("[COURSES_BY_AUTHOR_GET]", error)
    throw new Error("Failed to fetch author courses")
  }
}
