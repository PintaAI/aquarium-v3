import { notFound } from "next/navigation";
import { ModuleList } from "@/components/courses/module-list";
import { getModule } from "@/actions/module-actions";
import { ModuleHeader } from "@/components/courses/module-header";
import { ContentBody } from "@/components/courses/content-body";

interface ModulePageProps {
  params: Promise<{
    id: string;     // courseId
    moduleId: string;
  }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.id);
  const moduleId = parseInt(resolvedParams.moduleId);

  const moduleData = await getModule(courseId, moduleId);

  if (!moduleData) {
    notFound();
  }

  // Format modules for the ModuleList component
  const formattedModules = moduleData.course.modules.map((mod, index) => ({
    id: mod.id.toString(),
    courseId: courseId.toString(),
    title: mod.title,
    description: mod.description,
    duration: "Duration placeholder",
    isCompleted: false,
    isLocked: false,
    order: mod.order ?? index // menggunakan order dari data atau index sebagai fallback
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
        {/* Main Content */}
        <div className="space-y-4">
          <ModuleHeader 
            courseId={courseId}
            moduleId={moduleId}
            title={moduleData.title}
            courseAuthor={moduleData.course.author}
          />
          
          {/* Module Content */}
          <ContentBody htmlDescription={moduleData.htmlDescription} />
        </div>

        {/* Sidebar with Module List */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
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
