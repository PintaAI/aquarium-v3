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
  modules: initialModules,
  courseId,
  courseAuthorId 
}: CourseModuleSidebarContentProps) {
  // Convert string IDs to numbers for ModuleList
  const modules = initialModules.map(module => ({
    ...module,
    id: parseInt(module.id),
    courseId: parseInt(module.courseId)
  }));

  return (
    <div className="p-4">
      <ModuleList 
        modules={modules}
        courseId={parseInt(courseId)}
        courseAuthorId={courseAuthorId}
      />
    </div>
  )
}
