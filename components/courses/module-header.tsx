'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface ModuleHeaderProps {
  courseId: number
  moduleId: number
  title: string
  courseAuthor: {
    id: string
    name: string | null
  }
}

export function ModuleHeader({ courseId, moduleId, title, courseAuthor }: ModuleHeaderProps) {
  const { data: session } = useSession()
  const isAuthor = session?.user?.id === courseAuthor.id

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
      <h1 className="text-lg sm:text-2xl font-bold leading-tight">{title}</h1>
      {isAuthor && (
        <Link href={`/courses/${courseId}/modules/${moduleId}/edit-module`}>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
          >
            Edit Module
          </Button>
        </Link>
      )}
    </div>
  )
}
