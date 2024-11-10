export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Introduction to Marine Life",
      description: "Learn about the fascinating world of marine creatures and their habitats.",
      duration: "6 weeks",
      level: "Beginner"
    },
    {
      id: 2,
      title: "Aquarium Maintenance",
      description: "Master the essentials of maintaining a healthy aquarium environment.",
      duration: "4 weeks",
      level: "Intermediate"
    },
    {
      id: 3,
      title: "Marine Conservation",
      description: "Understand marine conservation principles and how to protect aquatic life.",
      duration: "8 weeks",
      level: "Advanced"
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div 
            key={course.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card"
          >
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="text-muted-foreground mb-4">{course.description}</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration: {course.duration}</span>
              <span className="text-muted-foreground">Level: {course.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
