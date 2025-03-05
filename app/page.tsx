import { ThemeToggle } from "@/components/theme-toggle"
import { AuthDrawer } from "@/components/auth/auth-drawer"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"

export default function Home() {
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
          <div className="flex justify-center gap-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 w-full p-4">
        <SiteFooter />
      </footer>
    </>
  )
}
