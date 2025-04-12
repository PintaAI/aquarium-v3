"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CourseListCard } from "@/components/courses/course-list-card";
import { getLatestJoinedCourses } from "@/app/actions/course-actions";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Course } from "@/app/actions/course-actions";
import { RecentCourse, getRecentCourses } from "@/lib/recent-courses";
import { getCurrentLocalTime, compareDates } from "@/lib/date-utils";

export function LatestCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);

  useEffect(() => {
    // Get recently accessed courses from localStorage
    setRecentCourses(getRecentCourses());

    // Fetch joined courses from server
    getLatestJoinedCourses().then((latestCourses) => {
      setCourses(latestCourses);
    });
  }, []);

  // Combine and deduplicate courses, prioritizing recently accessed
  // Combine and sort courses by last access/update time
  const combinedCourses = [...recentCourses];
  
  // Add joined courses that aren't in recent list
  courses.forEach(course => {
    if (!combinedCourses.some(c => c.id === course.id)) {
      combinedCourses.push({
        ...course,
        lastAccessed: getCurrentLocalTime()
      });
    }
  });

  // Sort by lastAccessed date using our compareDates utility
  combinedCourses.sort((a, b) => {
    return -compareDates(a.lastAccessed, b.lastAccessed); // Negative to reverse order (newest first)
  });

  // Limit to 3 items
  const displayCourses = combinedCourses.slice(0, 4);

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
                    course={course}
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
