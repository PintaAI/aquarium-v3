"use client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import dynamic from "next/dynamic"
import Image from "next/image"

// Dynamically import the Excalidraw wrapper with SSR disabled
const ExcalidrawWrapper = dynamic(
  async () => (await import("@/components/excalidraw/excalidraw-wrapper")).default,
  {
    ssr: false,
  }
);

export default function TeachPage() {
  const router = useRouter()
  const { session, isAuthenticated } = useAuth({ required: true })

  // Check role access after authentication
  if (isAuthenticated && session?.user?.role !== "GURU" && session?.user?.role !== "ADMIN") {
    router.push("/dashboard")
    return null
  }

  return (
    <>
      <header className="fixed top-0 w-full h-12 px-3 z-50 flex justify-between items-center bg-background border-b dark:border-gray-700">
        {/* Placeholder div to balance the layout */}
        <div className="w-10" />
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="font-semibold text-lg">Pejuangkorea</span>
        </Link>
        <div className="w-10">
          <ThemeToggle />
        </div>
      </header>
      <main className="h-screen w-screen">

        <div className="pt-12 h-full w-full">
          <ExcalidrawWrapper />
        </div>
      </main>
    </>
  );
}
