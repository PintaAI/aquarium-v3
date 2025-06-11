"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CourseListCard } from "@/components/courses/course-list-card";
import { getLatestJoinedCourses } from "@/app/actions/course-actions";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Course } from "@/app/actions/course-actions"; // Main Course type
import { RecentCourse, getRecentCourses } from "@/lib/recent-courses";
import { compareDates, getCurrentLocalTime } from "@/lib/date-utils";
import { CourseType } from "@prisma/client"; // For default type

// Interface for courses in the combined list, ensuring lastAccessed is present
interface CourseForDisplay extends Course {
  lastAccessed: Date;
}

export function LatestCourses() {
  const [serverCourses, setServerCourses] = useState<Course[]>([]);
  const [localRecentCourses, setLocalRecentCourses] = useState<RecentCourse[]>([]);

  useEffect(() => {
    // Get recently accessed courses from localStorage
    setLocalRecentCourses(getRecentCourses());

    // Fetch joined courses from server
    getLatestJoinedCourses().then((latestCourses) => {
      setServerCourses(latestCourses);
    });
  }, []);

  // Combine and deduplicate courses, prioritizing recently accessed
  const combinedAndSortedCourses: CourseForDisplay[] = (() => {
    const combined: CourseForDisplay[] = [];
    const processedIds = new Set<number>();

    // Add local recent courses first, ensuring they have all Course fields
    localRecentCourses.forEach(rc => {
      if (!processedIds.has(rc.id)) {
        combined.push({
          ...rc, // Spread RecentCourse properties
          type: CourseType.NORMAL, // Provide default type
          eventStartDate: null,    // Provide default eventStartDate
          eventEndDate: null,      // Provide default eventEndDate
          // lastAccessed is already part of RecentCourse
        } as CourseForDisplay); // Ensure it matches CourseForDisplay
        processedIds.add(rc.id);
      }
    });

    // Add server-fetched courses that aren't already in the list from local recent
    serverCourses.forEach(sc => {
      if (!processedIds.has(sc.id)) {
        combined.push({
          ...sc, // Spread Course properties
          // Use updatedAt or createdAt as lastAccessed if it's purely a server course
          lastAccessed: sc.updatedAt || sc.createdAt || getCurrentLocalTime(),
        });
        processedIds.add(sc.id);
      }
    });

    // Sort by lastAccessed date (newest first)
    combined.sort((a, b) => -compareDates(a.lastAccessed, b.lastAccessed));
    
    return combined;
  })();

  const displayCourses = combinedAndSortedCourses.slice(0, 4);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Materi</CardTitle>
          <Link
            href="/courses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            Selengkapnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px] w-full rounded-md">
          <div className="flex flex-row space-x-4 min-w-full p-1">
            {displayCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[150px] w-full text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Kamu belum bergabung dengan kursus apapun
                </p>
                <Link
                  href="/courses"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Cari di sini
                </Link>
              </div>
            ) : (
              displayCourses.map((course) => (
                <div key={course.id} className="w-[295px] flex-none">
                  <CourseListCard
                    course={course} // Now 'course' is of type CourseForDisplay, which is compatible with Course
                    isAuthor={false}
                    onDelete={() => {}}
                  />
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
