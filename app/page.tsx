import { ThemeToggle } from "@/components/theme-toggle"
import { AuthDrawer } from "@/components/auth/auth-drawer"
import { SiteFooter } from "@/components/site-footer"


export default function Home() {
  return (
    <>
      <header className="fixed top-0 right-0 p-4 flex items-center gap-4">
        <AuthDrawer />
        <ThemeToggle />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full text-center max-w-6xl">
          nothidden
        </div>
      </main>
      <footer className="fixed bottom-0 w-full p-4">
        <SiteFooter />
      </footer>
    </>
  );
}
