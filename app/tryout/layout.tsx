"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function TryoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <div className="flex flex-1 flex-col gap-4 p-0 sm:p-4 pb-24">
        <div className="mt-5 max-w-7xl mx-auto w-full ">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
