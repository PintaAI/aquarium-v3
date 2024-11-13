import { ModuleForm } from '@/components/courses/module-form';
import { getModuleForEditing } from '@/actions/module-actions';
import { currentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';

interface EditModulePageProps {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
}

export default async function EditModulePage(props: EditModulePageProps) {
  const params = await props.params;
  const user = await currentUser();
  const courseId = parseInt(params.id);
  const moduleId = parseInt(params.moduleId);

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

  const moduleData = await getModuleForEditing(courseId, moduleId);

  if (!moduleData) {
    notFound();
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Module</h1>
      <ModuleForm 
        courseId={courseId}
        initialData={{
          id: moduleData.id,
          title: moduleData.title,
          description: moduleData.description,
          jsonDescription: moduleData.jsonDescription,
          htmlDescription: moduleData.htmlDescription,
          order: moduleData.order
        }}
      />
    </div>
  );
}
