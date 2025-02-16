import { currentUser } from "@/lib/auth";
import Image from "next/image";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LatestCourses } from "@/components/dashboard/latest-courses";
import { LatestArticles } from "@/components/dashboard/latest-articles";
import { GameShortcuts } from "@/components/dashboard/game-shortcuts";
import { VocabularyCollection } from "@/components/dashboard/vocabulary-collection";
import { LearningProgress } from "@/components/dashboard/learning-progress";
import { DashboardCommand } from "@/components/dashboard/dashboard-command";
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
          <div className="container mx-auto py-2 px-2 space-y-6 pb-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Image
                  src="/images/logoo.png"
                  alt="Pejuangkorea Logo"
                  width={40}
                  height={40}
                  className="h-12 w-12"
                />
                <span className="text-xl font-bold">Pejuangkorea Academy</span>
              </div>
              <DashboardCommand />
            </div>
            
            <div className="grid grid-cols-12 gap-6 lg:gap-8">
              <div className="col-span-12 lg:col-span-3">
                <GameShortcuts />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <LatestCourses />
              </div>
              <div className="col-span-12 lg:col-span-3">
                <VocabularyCollection />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <LatestArticles />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
