'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Lock, PlayCircle, Plus, Pencil, Trash } from "lucide-react"
import { useSession } from "next-auth/react"
import { deleteModule } from "@/actions/module-actions"
import { useRouter } from "next/navigation"

interface Module {
  id: string
  courseId: string
  title: string
  description: string
  duration: string
  isCompleted?: boolean
  isLocked?: boolean
}

interface ModuleCardProps {
  module: Module
  isAuthor: boolean
}

function ModuleCard({ module, isAuthor }: ModuleCardProps) {
  const router = useRouter()
  const {
    id,
    courseId,
    title,
    description,
    duration,
    isCompleted = false,
    isLocked = false,
  } = module

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this module?')) {
      const result = await deleteModule(parseInt(id), parseInt(courseId))
      if (result.success) {
        router.refresh()
      } else {
        alert('Failed to delete module')
      }
    }
  }

  return (
    <div className={`p-4 border rounded-lg ${isLocked ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : isLocked ? (
              <Lock className="w-5 h-5 text-gray-400" />
            ) : (
              <PlayCircle className="w-5 h-5 text-blue-500" />
            )}
            <h3 className="font-medium">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <div className="text-sm text-muted-foreground mt-2">{duration}</div>
        </div>
        <div className="flex gap-2">
          {isAuthor && (
            <>
              <Link href={`/courses/${courseId}/modules/${id}/edit-module`}>
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
          {!isLocked && (
            <Link href={`/courses/${courseId}/${id}`}>
              <Button variant="outline" size="sm">
                {isCompleted ? 'Review' : 'Start'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

interface ModuleListProps {
  modules: Module[]
  courseId: string
  courseAuthorId: string
}

export function ModuleList({ modules, courseId, courseAuthorId }: ModuleListProps) {
  const { data: session } = useSession()
  const isAuthor = session?.user?.id === courseAuthorId

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Course Modules</h2>
        {isAuthor && (
          <Link href={`/courses/${courseId}/create-module`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} isAuthor={isAuthor} />
        ))}
      </div>
    </div>
  )
}
