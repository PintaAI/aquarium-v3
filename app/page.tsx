import { currentUser } from "@/lib/auth";
import Image from "next/image";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LatestCourses } from "@/components/menu/latest-courses";
import { LatestArticles } from "@/components/menu/latest-articles";
import { GameShortcuts } from "@/components/menu/game-shortcuts";
import { VocabularyCollection } from "@/components/menu/vocabulary-collection";
import { SearchBox } from "@/components/ui/search-box";
import Hero from "@/components/landing/hero";
import Fitur from "@/components/landing/fitur";
import Testimoni from "@/components/landing/testimoni";
import Cta from "@/components/landing/cta";
import Navbar from "@/components/navbar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function HomePage() {
  const user = await currentUser();

  if (!user) {
    return (
      <main>
        <Navbar />
        <Hero />
        <Fitur />
        <Testimoni />
        <Cta />
      </main>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex min-h-screen">
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-4 px-4 md:px-6 lg:px-8 space-y-1 pb-24">
            <header className="flex items-center justify-between  pb-2">
              <div className="flex items-center">
                <Image
                  src="/images/logoo.png"
                  alt="Pejuangkorea Logo"
                  width={40}
                  height={40}
                  className="h-12 w-12"
                  priority
                />
                <span className="text-md font-bold">Pejuangkorea Academy</span>
              </div>
            </header>
            
            <SearchBox
              placeholder="Search for courses, articles, or vocabulary..."
              className="mb-0"
            />
            
            <div className="grid grid-cols-12 gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <GameShortcuts />
                <VocabularyCollection />
              </div>
              
              {/* Main Content */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                <LatestCourses />
                <LatestArticles />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
