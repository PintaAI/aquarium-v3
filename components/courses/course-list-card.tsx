import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, UserIcon, TrashIcon, FolderIcon, Timer, Calendar, Crown } from "lucide-react";
import { Course } from "@/app/actions/course-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getEventStatus, getEventStatusText, getTimeRemaining, CourseWithEventInfo } from "@/lib/course-utils";
import { CourseType } from "@prisma/client";

interface CourseListCardProps {
  course: Course;
  isAuthor: boolean;
  onDelete: () => void;
}


const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export function CourseListCard({ course, isAuthor, onDelete }: CourseListCardProps) {
  // Get event status for event courses
  const courseForUtils: CourseWithEventInfo | null = course.type === 'EVENT' && course.eventStartDate && course.eventEndDate ? {
    id: course.id,
    type: course.type as CourseType,
    eventStartDate: course.eventStartDate,
    eventEndDate: course.eventEndDate,
    isLocked: course.isLocked,
    members: [] // Placeholder for members, as it's not available directly on `Course` for this util
  } : null;

  const eventStatus = courseForUtils ? getEventStatus(courseForUtils) : null;
  const timeRemaining = courseForUtils ? getTimeRemaining(courseForUtils) : null;

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1">
        <div className="relative">
          {/* All badges positioned on thumbnail */}
          <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
            <Badge 
              variant="secondary" 
              className={`backdrop-blur-sm ${
                course.level === 'BEGINNER' ? 'bg-emerald-500 text-emerald-50 hover:bg-emerald-600 dark:bg-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-600' :
                course.level === 'INTERMEDIATE' ? 'bg-blue-500 text-blue-50 hover:bg-blue-600 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600' :
                course.level === 'ADVANCED' ? 'bg-red-500 text-red-50 hover:bg-red-600 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600' :
                'bg-secondary text-secondary-foreground'
              }`}
            >
              <BookOpenIcon className="h-3 w-3 mr-1" />
              {course.level}
            </Badge>
            
            {course.isLocked && (
              <Badge variant="default" className="bg-yellow-500 text-yellow-50 hover:bg-yellow-600">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
            
            {course.type === 'EVENT' && (
              <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 bg-background/80">
                <Timer className="h-3 w-3 mr-1" />
                Event
              </Badge>
            )}
            
            {!course.isLocked && course.type !== 'EVENT' && (
              <Badge variant="secondary" className="bg-green-500 text-green-50 hover:bg-green-600">
                Free
              </Badge>
            )}
          </div>
          
          {course.modules?.length > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                <FolderIcon className="h-3 w-3 mr-1" />
                {course.modules.length}
              </Badge>
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
                  brightness-75
                  dark:brightness-50
                "
                priority
              />
            {isAuthor && (
              <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
            <div className="flex items-start justify-between mb-1.5">
              <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors flex-1">
                {course.title}
              </CardTitle>
            </div>
            
            <CardDescription className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {truncateText(course.description || 'No description available', 100)}
            </CardDescription>

            {/* Event Status Information */}
            {course.type === 'EVENT' && eventStatus && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  {eventStatus && (
                    <Badge variant="outline" className={
                      eventStatus === 'upcoming' ? 'border-blue-500 text-blue-600 dark:text-blue-400' :
                      eventStatus === 'active' ? 'border-green-500 text-green-600 dark:text-green-400' :
                      'border-red-500 text-red-600 dark:text-red-400'
                    }>
                      <Calendar className="h-3 w-3 mr-1" />
                      {getEventStatusText(eventStatus)}
                    </Badge>
                  )}
                  
                  {timeRemaining && (
                    <Badge variant="outline" className={
                      timeRemaining.isActive ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : 
                      'border-blue-500 text-blue-600 dark:text-blue-400'
                    }>
                      <Timer className="h-3 w-3 mr-1" />
                      {timeRemaining.timeLeft}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
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
