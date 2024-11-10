import { getCourses, getCourseWithModules } from "@/actions/course-actions";
import { CourseCard } from "@/components/courses";

async function CoursesPage() {
  const courses = await getCourses();
  const coursesWithModules = await Promise.all(
    courses.map(course => getCourseWithModules(course.id))
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesWithModules.map((course) => course && (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            imageUrl={course.thumbnail || undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default CoursesPage;
