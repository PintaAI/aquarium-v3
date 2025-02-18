import { currentUser } from "@/lib/auth";
import { getArticles } from "@/actions/article-actions";
import { getLiveSessions } from "@/actions/room-actions";
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
import { ActiveLiveSession } from "@/components/menu/active-live-session";

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
              placeholder="Cari artikel, kursus, game..."
              className="mb-0 bg-primary/35 rounded-lg"
            />
            
            <div className="grid grid-cols-10 gap-2 lg:gap-1">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <GameShortcuts />
                <VocabularyCollection />
                <ActiveLiveSession 
                  rooms={(await getLiveSessions()).map(room => ({
                    id: room.id,
                    title: room.name,
                    createdAt: room.createdAt,
                    host: {
                      name: room.creator.name,
                      image: room.creator.image
                    },
                    numParticipants: room.numParticipants || 0
                  }))} 
                />
              </div>
              
              {/* Main Content */}
              <div className="col-span-12 lg:col-span-7 space-y-6">
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
