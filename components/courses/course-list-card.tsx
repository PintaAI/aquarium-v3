import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, UserIcon, TrashIcon } from "lucide-react";
import { Course } from "@/actions/course-actions";

interface CourseListCardProps {
  course: Course;
  isAuthor: boolean;
  onDelete: () => void;
}

const getLevelColor = (level: string) => {
  const levelColors: Record<string, string> = {
    beginner: 'text-primary bg-primary/10 px-2 py-1 rounded-full',
    intermediate: 'text-primary bg-secondary px-2 py-1 rounded-full',
    advanced: 'text-destructive bg-destructive/10 px-2 py-1 rounded-full',
  };
  return levelColors[level.toLowerCase()] || 'text-muted-foreground bg-secondary px-2 py-1 rounded-full';
};

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export function CourseListCard({ course, isAuthor, onDelete }: CourseListCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1">
        <div className="relative h-32 w-full overflow-hidden">
          <Image
            src={course.thumbnail || '/images/course.jpg'}
            alt={`${course.title} thumbnail`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            priority
          />
          {isAuthor && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute top-2 left-2">
            {course.author.image ? (
              <Image
                src={course.author.image}
                alt={course.author.name || 'Unknown'}
                width={24}
                height={24}
                className="rounded-full border border-background shadow-sm"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <div>
            <CardTitle className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-1">
              {truncateText(course.description || 'No description available', 100)}
            </CardDescription>
          </div>
          <div className="mt-2">
            <span className={`text-xs font-medium ${getLevelColor(course.level)}`}>
              <BookOpenIcon className="h-3 w-3 mr-1 inline-block" aria-hidden="true" />
              {course.level}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
