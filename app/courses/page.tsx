import CourseList from "@/components/courses/course-list";
import { getCourses, Course } from "@/actions/course-actions";
import { auth } from "@/auth";
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
    
     
      <main>
        <CourseList
          initialCourses={courses}
          userRole={session?.user?.role}
          userId={session?.user?.id}
          error={error}
        />
        <div className="pb-16"></div>
      </main>
    
  );
}
