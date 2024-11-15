import { ModuleForm } from '@/components/courses/module-form'
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

interface CreateModulePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CreateModulePage(props: CreateModulePageProps) {
  const params = await props.params;
  const user = await currentUser();
  const courseId = parseInt(params.id);

  if (!user || user.role !== 'GURU') {
    redirect('/auth/login');
  }

  // Verify user owns the course
  const course = await db.course.findUnique({
    where: {
      id: courseId,
      authorId: user.id
    }
  });

  if (!course) {
    redirect('/courses');
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Module</h1>
      <ModuleForm courseId={courseId} />
    </div>
  );
}
