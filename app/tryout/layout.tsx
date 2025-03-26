"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { useParams } from "next/navigation";

export default function TryoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params?.id as string | undefined;

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
        <Breadcrumb className="px-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Beranda</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {!id ? (
              <BreadcrumbItem>
                <BreadcrumbPage>Tryout</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/tryout">Tryout</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Detail</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
