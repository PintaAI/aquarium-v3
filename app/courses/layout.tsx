"use client";

import { ReactNode, Fragment } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { AppSidebar } from "../../components/app-sidebar";
import { MobileNavbar } from "../../components/ui/mobile-navbar";
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
  
  const breadcrumbItems = segments.map((segment, index) => {
    // Handle dynamic segments (those in brackets)
    const isIdSegment = segment.startsWith('[') && segment.endsWith(']');
    const label = isIdSegment ? 'Detail Kursus' : (segmentLabels[segment] || segment);
    const isLast = index === segments.length - 1;
    const href = '/' + segments.slice(0, index + 1).join('/');

    if (isLast) {
      return (
        <BreadcrumbItem key={`item-${segment}`} className="hidden md:block">
          <BreadcrumbPage>{label}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    }

    return (
      <Fragment key={`fragment-${segment}`}>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
      </Fragment>
    );
  });

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
