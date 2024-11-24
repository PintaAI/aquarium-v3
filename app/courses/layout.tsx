"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MobileNavbar } from "../../components/mobile-navbar";
import { SidebarProvider } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        
        <main className="flex-1 p-4">
          <nav aria-label="breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li className="inline-flex items-center gap-1.5">
                <Link 
                  href="/" 
                  className="transition-colors hover:text-foreground"
                >
                  Beranda
                </Link>
              </li>

              {segments.map((segment, index) => {
                const path = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;

                return (
                  <li key={path} className="inline-flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5" />
                    {isLast ? (
                      <span className="font-normal text-foreground capitalize">
                        {segment.replace(/-/g, " ")}
                      </span>
                    ) : (
                      <Link 
                        href={path}
                        className="transition-colors hover:text-foreground capitalize"
                      >
                        {segment.replace(/-/g, " ")}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mt-4">
            {children}
          </div>
        </main>
      </div>
      <MobileNavbar />
    </SidebarProvider>
  );
}
