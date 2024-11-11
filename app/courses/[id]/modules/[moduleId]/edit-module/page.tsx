import { ModuleForm } from '@/components/courses/module-form'
import { getModuleForEditing } from '@/actions/module-actions'
import { currentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'

interface EditModulePageProps {
  params: {
    id: string
    moduleId: string
  }
}

export default async function EditModulePage({ params }: EditModulePageProps) {
  const user = await currentUser()
  const courseId = parseInt(params.id)
  const moduleId = parseInt(params.moduleId)

  if (!user || user.role !== 'GURU') {
    redirect('/auth/login')
  }

  // Verify user owns the course
  const course = await db.course.findUnique({
    where: {
      id: courseId,
      authorId: user.id
    }
  })

  if (!course) {
    redirect('/courses')
  }

  const module = await getModuleForEditing(courseId, moduleId)

  if (!module) {
    notFound()
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Module</h1>
      <ModuleForm 
        courseId={courseId}
        initialData={{
          id: module.id,
          title: module.title,
          description: module.description,
          jsonDescription: module.jsonDescription,
          htmlDescription: module.htmlDescription,
          order: module.order
        }}
      />
    </div>
  )
}
