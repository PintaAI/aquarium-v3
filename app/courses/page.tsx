import { getCourses, getCourseWithModules } from "@/actions/course-actions"

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
          <div 
            key={course.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <span className="text-sm text-muted-foreground">ID: {course.id}</span>
            </div>
            <p className="text-muted-foreground mb-4">{course.description}</p>
            <div className="space-y-2">
              <h3 className="font-medium">Modules:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {course.modules.map((module) => (
                  <li key={module.id}>
                    {module.title} (ID: {module.id})
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-muted-foreground">Level: {course.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoursesPage;
