import { currentUser } from "@/lib/auth";
import { getArticles } from "@/app/actions/article-actions";

import { UpcomingTryoutBanner } from "@/components/tryout/upcoming-tryout-banner";
import { UpcomingLiveSessionBanner } from "@/components/live-session/upcoming-live-session-banner";
import Image from "next/image";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LatestCourses } from "@/components/menu/latest-courses";
import { LatestArticles } from "@/components/menu/latest-articles";
import { GameShortcuts } from "@/components/menu/game-shortcuts";
import { VocabularyCollection } from "@/components/menu/vocabulary-collection";
import { SearchBox } from "@/components/ui/search-box";
import { AppSidebar } from "@/components/app-sidebar";
import { LandingHero } from "@/components/landingpage";
import { GuruTools } from "@/components/menu/guru-tools";
import { RandomFlashcardQuiz } from "@/components/vocabulary/RandomFlashcardQuiz"; // Import the new component
import { CoursePromotionBanner } from "@/components/courses/course-promotion-banner";

export default async function HomePage() {
  const user = await currentUser();

  if (!user) {
    return (
      <main>
        <div className="w-full p-4">
          <CoursePromotionBanner />
        </div>
        <LandingHero />
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
        <main className="flex-1 overflow-y-auto ">
           <CoursePromotionBanner />
          <div className="container mx-auto py-4 px-4 md:px-6 lg:px-8 space-y-2 pb-24 md:pb-0">
           
            <div>
              <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3 pb-2">
                <div className="flex items-center group cursor-pointer">
                  <Image
                    src="/images/logoo.png"
                    alt="Pejuangkorea Logo"
                    width={40}
                    height={40}
                    className="h-12 w-12"
                    priority
                  />
                  <span className="md:text-lg text-xl font-extrabold bg-gradient-to-r from-primary to-primary/70 group-hover:from-primary/90 group-hover:to-primary/60 bg-clip-text text-transparent drop-shadow-sm tracking-tight transition-[background] duration-300">
                    Pejuangkorea Academy
                  </span>
                </div>
                <div className="w-full md:w-[600px] space-y-2">
                  <UpcomingLiveSessionBanner />
                  <UpcomingTryoutBanner />
                </div>
              </header>
              <SearchBox
                placeholder="Cari artikel, kursus, kosakata, game..."
                className="mb-0 bg-gradient-to-b from-primary/20 via-primary/5 to-background/60 hover:from-primary/20 hover:via-primary/10 hover:to-background/80 focus-within:from-primary/30 focus-within:via-primary/20 focus-within:to-background border border-border/40 hover:border-border/60 focus-within:border-border rounded-lg shadow-sm hover:shadow-md focus-within:shadow-md transition-all duration-200"
              />
            </div>
            
            <div className="grid grid-cols-10 gap-2 lg:gap-2">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-3 space-y-2">
              <GuruTools role={user?.role} />
                <GameShortcuts />
                <RandomFlashcardQuiz /> {/* Moved component here */}
                <VocabularyCollection />
              </div>
              
              {/* Main Content */}
              <div className="col-span-12 lg:col-span-7 space-y-2">
                
                <LatestCourses />
                <LatestArticles articles={await getArticles()} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
