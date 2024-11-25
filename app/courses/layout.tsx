"use client";

import { ReactNode, Fragment } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { AppSidebar } from "../../components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import { Separator } from "../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/courses">Kursus</BreadcrumbLink>
              </BreadcrumbItem>
              {segments.length > 0 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
              {breadcrumbItems}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
