import CourseList from "@/components/courses/course-list";
import { getCourses, Course } from "@/actions/course-actions";
import { auth } from "@/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function CoursesPage() {
  const session = await auth();
  let courses: Course[] = [];
  let error: string | null = null;

  try {
    courses = await getCourses();
  } catch (e) {
    error = "Failed to fetch courses";
    console.error(e);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <CourseList
          initialCourses={courses}
          userRole={session?.user?.role}
          userId={session?.user?.id}
          error={error}
        />
      </main>
    </SidebarProvider>
  );
}
