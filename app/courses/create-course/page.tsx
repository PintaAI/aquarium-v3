import { CourseForm } from '@/components/courses/course-form'
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function CreateCoursePage() {
  const user = await currentUser()

  if (!user || user.role !== 'GURU') {
    redirect('/auth/login')
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
      <CourseForm />
    </div>
  )
}
