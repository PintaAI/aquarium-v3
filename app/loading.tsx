"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Loading() {
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
          <div className="container mx-auto py-4 px-4 md:px-6 lg:px-8 space-y-2 pb-24">
            <div className="space-y-4">
              <header className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3 pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="w-full md:w-[600px]">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </header>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            
            <div className="grid grid-cols-10 gap-2 lg:gap-2">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-3 space-y-2">
                <Skeleton className="h-[120px] w-full rounded-lg" />
                <Skeleton className="h-[180px] w-full rounded-lg" />
                <Skeleton className="h-[160px] w-full rounded-lg" />
              </div>
              
              {/* Main Content */}
              <div className="col-span-12 lg:col-span-7 space-y-2">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48 rounded-lg" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-[200px] rounded-lg" />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48 rounded-lg" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-[100px] rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
