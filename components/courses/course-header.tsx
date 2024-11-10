import { Button } from "@/components/ui/button";

interface CourseHeaderProps {
  title: string;
  description: string;
  instructor: string;
  totalModules: number;
  duration: string;
  onEnroll?: () => void;
  isEnrolled?: boolean;
}

export function CourseHeader({
  title,
  description,
  instructor,
  totalModules,
  duration,
  onEnroll,
  isEnrolled = false,
}: CourseHeaderProps) {
  return (
    <div className="space-y-4 pb-6 border-b">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            By {instructor}
          </p>
        </div>
        {onEnroll && !isEnrolled && (
          <Button onClick={onEnroll}>
            Enroll Now
          </Button>
        )}
      </div>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <div>{totalModules} modules</div>
        <div>{duration}</div>
      </div>
      <p className="text-sm leading-6">
        {description}
      </p>
    </div>
  );
}
