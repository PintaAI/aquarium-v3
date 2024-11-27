"use client"

import { ModuleList } from "../courses/module-list"

interface CourseModuleSidebarContentProps {
  courseId: string
  courseAuthorId: string
  modules: {
    id: string
    courseId: string
    title: string
    description: string
    duration: string
    order: number
    isCompleted?: boolean
    isLocked?: boolean
  }[]
}

export function CourseModuleSidebarContent({ 
  modules,
  courseId,
  courseAuthorId 
}: CourseModuleSidebarContentProps) {
  return (
    <div className="p-4">
      <ModuleList 
        modules={modules}
        courseId={courseId}
        courseAuthorId={courseAuthorId}
      />
    </div>
  )
}
