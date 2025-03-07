"use client";

import { ReactNode, Fragment } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { AppSidebar } from "../../components/app-sidebar";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import {
  
  SidebarProvider,

} from "../../components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

const segmentLabels: Record<string, string> = {
  'courses': 'Kursus',
  'create-course': 'Buat Kursus',
  'edit-course': 'Edit Kursus',
  'create-module': 'Buat Modul',
};

export default function Layout({ children }: LayoutProps) {
  const segments = useSelectedLayoutSegments();
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <div className="flex flex-1 flex-col gap-4 p-0 sm:p-4 pb-16 md:pb-4">
        {children}
      </div>
      
    </SidebarProvider>
  );
}
