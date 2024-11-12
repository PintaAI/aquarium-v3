import { notFound } from "next/navigation";
import { ModuleList } from "@/components/courses/module-list";
import { getModule } from "@/actions/module-actions";
import { ModuleHeader } from "@/components/courses/module-header";

interface ModulePageProps {
  params: {
    id: string;     // courseId
    moduleId: string;
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const courseId = parseInt(params.id);
  const moduleId = parseInt(params.moduleId);

  const moduleData = await getModule(courseId, moduleId);

  if (!moduleData) {
    notFound();
  }

  // Format modules for the ModuleList component
  const formattedModules = moduleData.course.modules.map(mod => ({
    id: mod.id.toString(),
    courseId: courseId.toString(),
    title: mod.title,
    description: mod.description,
    duration: "Duration placeholder",
    isCompleted: false,
    isLocked: false
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
          
          {/* Module Content - Using htmlDescription for fast rendering */}
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: moduleData.htmlDescription }} />
          </div>
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
