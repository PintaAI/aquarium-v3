"use client";

import { notFound } from "next/navigation";
import { ModuleList } from "@/components/courses/module-list";
import { getModule, completeModule } from "@/actions/module-actions";
import { ModuleHeader } from "@/components/courses/module-header";
import { ContentBody } from "@/components/courses/content-body";
import { useState, useEffect } from "react";

interface ModulePageProps {
  params: Promise<{
    id: string;     // courseId
    moduleId: string;
  }>;
}

interface ModuleData {
  id: number;
  title: string;
  description: string;
  htmlDescription: string;
  order: number;
  courseId: number;
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
    }>;
  };
}

export default function ModulePage({ params }: ModulePageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string; moduleId: string } | null>(null);
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setResolvedParams(unwrappedParams);
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      const courseId = parseInt(resolvedParams.id);
      const moduleId = parseInt(resolvedParams.moduleId);

      const fetchModuleData = async () => {
        const data = await getModule(courseId, moduleId);
        if (!data) {
          notFound();
        } else {
          setModuleData(data as ModuleData);
          // Assume module is not completed initially
          setIsCompleted(false);
        }
      };

      fetchModuleData();
    }
  }, [resolvedParams]);

  const handleComplete = async () => {
    if (resolvedParams) {
      const courseId = parseInt(resolvedParams.id);
      const moduleId = parseInt(resolvedParams.moduleId);
      const result = await completeModule(courseId, moduleId);
      if (result.success) {
        setIsCompleted(true);
      } else {
        console.error("Failed to mark module as completed");
      }
    }
  };

  if (!moduleData) {
    return <div>Loading...</div>;
  }

  // Format modules for the ModuleList component
  const formattedModules = moduleData.course.modules.map((mod, index) => ({
    id: mod.id.toString(),
    courseId: moduleData.courseId.toString(),
    title: mod.title,
    description: mod.description,
    duration: "Duration placeholder",
    isLocked: false,
    order: mod.order ?? index // menggunakan order dari data atau index sebagai fallback
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
        {/* Main Content */}
        <div className="space-y-4">
          <ModuleHeader 
            courseId={moduleData.courseId}
            moduleId={moduleData.id}
            title={moduleData.title}
            courseAuthor={moduleData.course.author}
          />
          
          {/* Module Content */}
          <ContentBody htmlDescription={moduleData.htmlDescription} />

          {/* Mark as Completed Button */}
          <button 
            onClick={handleComplete} 
            disabled={isCompleted}
            className={`mt-4 px-4 py-2 text-white ${isCompleted ? 'bg-gray-400' : 'bg-blue-500'} rounded`}
          >
            {isCompleted ? "Completed" : "Mark as Completed"}
          </button>
        </div>

        {/* Sidebar with Module List */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <ModuleList 
              modules={formattedModules} 
              courseId={moduleData.courseId.toString()}
              courseAuthorId={moduleData.course.author.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
