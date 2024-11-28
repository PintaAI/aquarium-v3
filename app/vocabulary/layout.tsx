"use client";

import { ReactNode } from "react";
import { AppSidebar } from "../../components/app-sidebar";
import { SidebarProvider } from "../../components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <div className="flex flex-1 flex-col gap-4 p-0 sm:p-4">
        {children}
      </div>
    </SidebarProvider>
  );
}
