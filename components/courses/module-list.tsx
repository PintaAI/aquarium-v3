import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const {
    id,
    courseId,
    title,
    description,
    duration,
    isCompleted = false,
    isLocked = false,
  } = module;

  return (
    <div className={`p-4 border rounded-lg ${isLocked ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : isLocked ? (
              <Lock className="w-5 h-5 text-gray-400" />
            ) : (
              <PlayCircle className="w-5 h-5 text-blue-500" />
            )}
            <h3 className="font-medium">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <div className="text-sm text-muted-foreground mt-2">{duration}</div>
        </div>
        {!isLocked && (
          <Link href={`/courses/${courseId}/${id}`}>
            <Button variant="outline" size="sm">
              {isCompleted ? 'Review' : 'Start'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

interface ModuleListProps {
  modules: Module[];
}

export function ModuleList({ modules }: ModuleListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Course Modules</h2>
      <div className="space-y-3">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
}
