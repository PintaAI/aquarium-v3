"use client";

import { ReactNode } from "react";
import { MobileNavbar } from "../../components/mobile-navbar";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";

interface CoursesLayoutProps {
  children: ReactNode;
}

export default function CoursesLayout({ children }: CoursesLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="max-w-7xl mx-auto">
                {children}
                <MobileNavbar />
      </main>
    </SidebarProvider>
  );
}
