import { CourseForm } from '@/components/courses/course-form'
import { getCourse } from '@/app/actions/course-actions'
import { notFound, redirect } from 'next/navigation'
import { CourseLevel, CourseType } from '@prisma/client' // Added CourseType
import { currentUser } from '@/lib/auth'

interface EditCoursePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCoursePage(props: EditCoursePageProps) {
  const params = await props.params;
  const user = await currentUser()

  if (!user || user.role !== 'GURU') {
    redirect('/auth/login')
  }

  const courseId = parseInt(params.id)
  const courseData = await getCourse(courseId)

  if (!courseData) {
    notFound()
  }

  // Verify user owns the course
  if (courseData.author.id !== user.id) {
    redirect('/courses')
  }

  // Extract only the fields we need and ensure they match the expected types
  const course = {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description || '',
    level: courseData.level as CourseLevel,
    type: courseData.type as CourseType, // Added type
    eventStartDate: courseData.eventStartDate, // Added eventStartDate
    eventEndDate: courseData.eventEndDate, // Added eventEndDate
    thumbnail: courseData.thumbnail,
    jsonDescription: courseData.jsonDescription || '',
    htmlDescription: courseData.htmlDescription || '',
    isLocked: courseData.isLocked
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <CourseForm initialData={course} />
    </div>
  )
}
