
import { getCourse } from "@/app/actions/course-actions";
import { notFound } from "next/navigation";
import { ModuleList } from "@/components/courses/module-list";
import { CourseHeader } from "@/components/courses/course-header";
import { ContentBody } from "@/components/courses/content-body";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@/lib/auth";

interface CourseIdPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseIdPage(props: CourseIdPageProps) {
  const params = await props.params;
  const courseId = parseInt(params.id);
  const course = await getCourse(courseId);
  const user = await currentUser();

  if (!course) {
    notFound();
  }

  // Check if user has joined the course
  const isJoined = user ? course.members?.some(member => member.id === user.id) ?? false : false;

  // Transform modules to match the ModuleList component's expected format
  const formattedModules = course.modules.map((module, index) => ({
    id: module.id.toString(),
    courseId: courseId.toString(),
    title: module.title,
    description: module.description ?? "",
    duration: "Duration placeholder",
    isCompleted: module.completions?.length > 0,
    isLocked: false,
    order: module.order ?? index // Use existing order or fallback to index
  }));

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <Button asChild variant="ghost" className="mb-6 text-primary hover:text-primary/90">
        <Link href="/courses" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CourseHeader
            id={course.id}
            title={course.title}
            thumbnail={course.thumbnail}
            author={course.author}
            level={course.level}
            moduleCount={course.modules.length}
            isJoined={isJoined}
          />
          
          <div className="mt-6">
            <ContentBody htmlDescription={course.htmlDescription ?? course.description ?? ""} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ModuleList 
              modules={formattedModules} 
              courseId={courseId.toString()}
              courseAuthorId={course.author.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
