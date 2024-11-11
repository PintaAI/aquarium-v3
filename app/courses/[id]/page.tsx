import { getCourse } from "@/actions/course-actions";
import { notFound } from "next/navigation";
import { ModuleList } from "@/components/courses/module-list";
import { CourseHeader } from "@/components/courses/course-header";
import { CourseBody } from "@/components/courses/course-body";

interface CourseIdPageProps {
  params: {
    id: string;
  };
}

export default async function CourseIdPage({ params }: CourseIdPageProps) {
  const courseId = parseInt(params.id);
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  // Transform modules to match the ModuleList component's expected format
  const formattedModules = course.modules.map(module => ({
    id: module.id.toString(),
    courseId: courseId.toString(),
    title: module.title,
    description: module.description,
    duration: "Duration placeholder",
    isCompleted: false,
    isLocked: false
  }));

  return (
    <div className="container mx-auto p-6">
      <CourseHeader
        id={course.id}
        title={course.title}
        thumbnail={course.thumbnail}
        author={course.author}
        level={course.level}
      />
      <CourseBody htmlDescription={course.htmlDescription} />
      <div className="mt-8">
        <ModuleList 
          modules={formattedModules} 
          courseId={courseId.toString()}
          courseAuthorId={course.author.id}
        />
      </div>
    </div>
  );
}
