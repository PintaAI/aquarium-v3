import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, UserIcon, TrashIcon, LockIcon, FolderIcon } from "lucide-react";
import { Course } from "@/app/actions/course-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourseListCardProps {
  course: Course;
  isAuthor: boolean;
  onDelete: () => void;
}

const getLevelColor = (level: string) => {
  const levelColors: Record<string, string> = {
    BEGINNER: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-1 rounded-full',
    INTERMEDIATE: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50 px-2 py-1 rounded-full',
    ADVANCED: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 px-2 py-1 rounded-full',
  };
  return levelColors[level] || 'text-muted-foreground bg-secondary px-2 py-1 rounded-full';
};

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export function CourseListCard({ course, isAuthor, onDelete }: CourseListCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className={`group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1 ${course.isLocked ? 'opacity-60' : ''}`}>
        {course.isLocked && (
          <div className="absolute inset-0 z-20 bg-background/5 backdrop-blur-[1px] flex items-center justify-center">
            <LockIcon className="h-16 w-16 text-muted-foreground opacity-80" />
          </div>
        )}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <span className={`text-xs font-medium ${getLevelColor(course.level)} flex items-center gap-1 backdrop-blur-sm`}>
              <BookOpenIcon className="h-3 w-3" aria-hidden="true" />
              {course.level}
            </span>
          </div>
          {course.modules?.length > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <span className="text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded-full flex items-center gap-1">
                <FolderIcon className="h-3 w-3" aria-hidden="true" />
                {course.modules.length} {course.modules.length === 1 ? 'Module' : 'Modules'}
              </span>
            </div>
          )}
          <div className="h-28 w-full overflow-hidden">
              <Image
                src={course.thumbnail || '/images/course.jpg'}
                alt={`${course.title} thumbnail`}
                fill
                className="
                  object-cover 
                  group-hover:scale-120 
                  transition-transform 
                  duration-300
                  dark:brightness-70
                "
                priority
              />
            {isAuthor && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="absolute group-hover:scale-120 inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          </div>
        </div>
        <CardContent className="p-4">
          <div>
            <CardTitle className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {truncateText(course.description || 'No description available', 100)}
            </CardDescription>
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={course.author.image || undefined} alt={course.author.name || 'Unknown'} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {course.author.name || 'Unknown Author'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
