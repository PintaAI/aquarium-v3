"use client"

import { useEffect } from "react"
import { Course } from "@/app/actions/course-actions"
import { addToRecentCourses } from "@/lib/recent-courses"

interface CourseAccessTrackerProps {
  course: Course
  children: React.ReactNode
}

export function CourseAccessTracker({ course, children }: CourseAccessTrackerProps) {
  useEffect(() => {
    // Add course to recent when accessed
    addToRecentCourses({
      ...course,
      createdAt: new Date(course.createdAt),
      updatedAt: new Date(course.updatedAt),
    })
  }, [course])

  return <>{children}</>
}
