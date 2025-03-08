import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CourseListCard } from "@/components/courses/course-list-card";
import { getLatestJoinedCourses } from "@/app/actions/course-actions";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export async function LatestCourses() {
  const courses = await getLatestJoinedCourses(); // Already returns latest 3 joined courses

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
            {courses.length === 0 ? (
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
              courses.map((course) => (
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
