import { notFound } from "next/navigation";
import { use } from "react";
import { getModule } from "@/app/actions/module-actions";
import { ModuleClientContent } from "./module-client";

type PageProps = {
  params?: Promise<{
    id: string;     // courseId
    moduleId: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

interface ModuleData {
  id: number;
  title: string;
  description: string;
  htmlDescription: string;
  order: number;
  courseId: number;
  completions: Array<{
    isCompleted: boolean;
  }>;
  userCompletions: Array<{
    isCompleted: boolean;
  }>;
  course: {
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    modules: Array<{
      id: number;
      title: string;
      description: string;
      order: number;
      courseId: number;
      completions: Array<{
        isCompleted: boolean;
      }>;
    }>;
  };
}

async function ModuleContent({ courseId, moduleId }: { courseId: number, moduleId: number }) {
  const data = await getModule(courseId, moduleId) as ModuleData;
  
  if (!data) {
    notFound();
  }

  const formattedModules = data.course.modules.map((mod, index) => ({
    id: mod.id,
    courseId: data.courseId,
    title: mod.title,
    description: mod.description,
    duration: "⇋ 30 menit",
    isLocked: false,
    isCompleted: mod.completions?.length > 0,
    order: mod.order ?? index
  }));

  return (
    <ModuleClientContent
      data={data}
      formattedModules={formattedModules}
      initialIsCompleted={data.completions?.[0]?.isCompleted || false}
    />
  );
}

export default function ModulePage(props: PageProps) {
  if (!props.params) {
    notFound();
  }
  
  const params = use(props.params);
  
  if (!params.id || !params.moduleId) {
    notFound();
  }
  
  const courseId = parseInt(params.id);
  const moduleId = parseInt(params.moduleId);

  return <ModuleContent courseId={courseId} moduleId={moduleId} />;
}
