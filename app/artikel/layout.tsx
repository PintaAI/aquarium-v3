"use client";

import { ReactNode } from "react";
import { AppSidebar } from "../../components/app-sidebar";

import {
  SidebarProvider,
} from "../../components/ui/sidebar";

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
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      
    </SidebarProvider>
  );
}
