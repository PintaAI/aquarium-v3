import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CourseListCard } from "@/components/courses/course-list-card";
import { getLatestJoinedCourses } from "@/actions/course-actions";

export async function LatestCourses() {
  const courses = await getLatestJoinedCourses(); // Already returns latest 3 joined courses

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-md">Kursus-mu</CardTitle>
          <a
            href="/courses"
            className="text-xs font-medium hover:underline"
          >
            Selenhkapnya
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[249px] w-full rounded-md">
          <div className="space-y-4">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[150px] text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Kamu belum bergabung dengan kursus apapun
                </p>
                <a
                  href="/courses"
                  className="text-xs font-medium hover:underline text-primary"
                >
                  Cari di sini
                </a>
              </div>
            ) : (
              courses.map((course) => (
              <CourseListCard
                key={course.id}
                course={course}
                isAuthor={false}
                onDelete={() => {}}
              />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
