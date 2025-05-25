"use client";

import { useState } from "react";
import { ModuleList } from "@/components/courses/module-list";
import { ModuleHeader } from "@/components/courses/module-header";
import { ContentBody } from "@/components/courses/content-body";
import { completeModule } from "@/app/actions/module-actions";

interface ModuleClientContentProps {
  data: {
    id: number;
    courseId: number;
    title: string;
    htmlDescription: string;
    course: {
      author: {
        id: string;
        name: string | null;
        image: string | null;
      };
    };
  };
  formattedModules: Array<{
    id: number;
    courseId: number;
    title: string;
    description: string;
    duration: string;
    isLocked: boolean;
    isCompleted: boolean;
    order: number;
  }>;
  initialIsCompleted: boolean;
}

export function ModuleClientContent({ data, formattedModules, initialIsCompleted }: ModuleClientContentProps) {
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);

  const handleToggleComplete = async () => {
    const result = await completeModule(data.courseId, data.id, !isCompleted);
    if (result.success) {
      setIsCompleted(!isCompleted);
    } else {
      console.error("Failed to update module completion");
    }
  };

  return (
    <div className="w-full mx-auto max-w-7xl p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Content */}
        <div className="space-y-3 sm:space-y-4 flex-1">
          <ModuleHeader 
            courseId={data.courseId}
            moduleId={data.id}
            title={data.title}
            courseAuthor={data.course.author}
          />
          
          {/* Module Content */}
          <ContentBody htmlDescription={data.htmlDescription} />

          {/* Toggle Complete Button */}
          <button 
            onClick={handleToggleComplete}
            className={`w-full sm:w-auto mt-2 sm:mt-4 px-4 py-2 text-sm sm:text-base rounded-lg
              ${isCompleted 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-primary hover:bg-primary/90 text-background'} 
              transition-colors duration-200 font-medium`}
          >
            {isCompleted ? "✓ Selesai" : "Tandai Selesai"}
          </button>
        </div>

        {/* Sidebar with Module List */}
        <div className="lg:w-[330px] w-full">
          <div>
            <ModuleList 
              modules={formattedModules} 
              courseId={data.courseId}
              courseAuthorId={data.course.author.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
