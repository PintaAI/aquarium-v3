import { ThemeToggle } from "@/components/theme-toggle"
import { AuthDrawer } from "@/components/auth/auth-drawer"
import { SiteFooter } from "@/components/site-footer"
import { getCourses } from "@/app/actions/courses-actions"
import { getVocabularyCollections } from "@/app/actions/vocabulary-actions"
import { getModules } from "@/app/actions/module-actions"
import { CourseCard } from "@/components/card/course-card"
import { VocabularyCard } from "@/components/card/vocabulary-card"
import { ModuleCard } from "@/components/card/module-card"
import Link from "next/link"

export default async function Home() {
  const courses = await getCourses()
  const collections = await getVocabularyCollections()
  const modules = courses.length > 0 ? await getModules(courses[0].id) : []
  return (
    <>
      <header className="fixed top-0 right-0 p-4 flex items-center gap-4">
        <AuthDrawer />
        <ThemeToggle />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to Aquarium</h1>
          <p className="text-lg mb-8 text-muted-foreground">
            A platform for learning and teaching.
          </p>
          <div className="flex flex-col items-center gap-8">
            <div className="flex justify-center gap-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Go to Dashboard
            </Link>
            </div>
            
            <div className="w-full grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Featured Collection</h2>
                  <VocabularyCard
                    title={collections[0].title}
                    description={collections[0].description}
                    user={collections[0].user}
                    totalItems={collections[0].totalItems}
                    checkedItems={collections[0].checkedItems}
                  />
                </div>
              )}

              {/* Single Course Card */}
              {courses.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Featured Course</h2>
                  <CourseCard course={courses[0]} />
                </div>
              )}

              {/* Single Module Card */}
              {modules.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Featured Module</h2>
                  <ModuleCard
                    title={modules[0].title}
                    description={modules[0].description}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 w-full p-4">
        <SiteFooter />
      </footer>
    </>
  )
}
