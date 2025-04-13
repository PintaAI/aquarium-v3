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
      
        <div className="mt-5 max-w-7xl mx-auto w-full ">
          {children}
        </div>
      
    </SidebarProvider>
  );
}
