"use client";

import { Toaster } from 'sonner'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function LiveSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <Toaster />
      <AppSidebar />
      <div className=" max-w-7xl mx-auto w-full mb-24 md:mb-0 ">
        {children}
      </div>
    </SidebarProvider>
  )
}
