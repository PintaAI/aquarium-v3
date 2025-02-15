"use client";

import { ReactNode } from "react";
import { AppSidebar } from "../../components/app-sidebar";
import {
  SidebarInset,
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
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pb-24">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
