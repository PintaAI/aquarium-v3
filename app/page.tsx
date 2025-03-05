"use client"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthDrawer } from "@/components/auth/auth-drawer"
import { SiteFooter } from "@/components/site-footer"
import dynamic from "next/dynamic"
import "/public/css/excalidraw-fixed.css"

// Dynamically import the Excalidraw wrapper with SSR disabled
const ExcalidrawWrapper = dynamic(
  async () => (await import("@/components/excalidraw/excalidraw-wrapper")).default,
  {
    ssr: false,
  }
);


export default function Home() {
  return (
    <>
      <header className="fixed top-0 right-0 p-4 flex items-center gap-4">
        <AuthDrawer />
        <ThemeToggle />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <h1 className="text-2xl font-bold mb-4 text-center">Excalidraw Editor</h1>
          <div className="border rounded-lg overflow-hidden">
            <ExcalidrawWrapper height="600px" />
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 w-full p-4">
        <SiteFooter />
      </footer>
    </>
  );
}
