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
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {isAuthor && (
        <Link href={`/courses/${courseId}/modules/${moduleId}/edit-module`}>
          <Button variant="outline" size="sm">
            Edit Module
          </Button>
        </Link>
      )}
    </div>
  )
}
