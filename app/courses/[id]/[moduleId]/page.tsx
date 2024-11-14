import { notFound } from "next/navigation";
import { ModuleList } from "@/components/courses/module-list";
import { getModule } from "@/actions/module-actions";
import { ModuleHeader } from "@/components/courses/module-header";
import { Button } from "@/components/ui/button";
import { ContentBody } from "@/components/courses/content-body";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ModulePageProps {
  params: Promise<{
    id: string;     // courseId
    moduleId: string;
  }>;
}

interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
}

export default async function ModulePage(props: ModulePageProps) {
  const params = await props.params;
  const courseId = parseInt(params.id);
  const moduleId = parseInt(params.moduleId);

  const moduleData = await getModule(courseId, moduleId);

  if (!moduleData) {
    notFound();
  }

  // Format modules for the ModuleList component
  const formattedModules = moduleData.course.modules.map((mod: Module, index) => ({
    id: mod.id.toString(),
    courseId: courseId.toString(),
    title: mod.title,
    description: mod.description,
    duration: "Duration placeholder",
    isCompleted: false,
    isLocked: false,
    order: mod.order ?? index // Use existing order or fallback to index
  }));

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <Button asChild variant="ghost" className="mb-6 text-primary hover:text-primary/90">
        <Link href={`/courses/${courseId}`} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ModuleHeader 
            courseId={courseId}
            moduleId={moduleId}
            title={moduleData.title}
            courseAuthor={moduleData.course.author}
          />
          
          {/* Module Content - Using ContentBody for consistent styling */}
          <div className="mt-6">
            <ContentBody htmlDescription={moduleData.htmlDescription} />
          </div>
        </div>

        {/* Sidebar with Module List */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ModuleList 
              modules={formattedModules} 
              courseId={courseId.toString()}
              courseAuthorId={moduleData.course.author.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
