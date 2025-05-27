"use client"

import { ReactNode } from "react"
import { AppSidebar } from "../../components/app-sidebar"
import { SidebarProvider } from "../../components/ui/sidebar"
import { games } from "@/data/games"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

interface GameLayoutProps {
  children: ReactNode
}

export default function GameLayout({ children }: GameLayoutProps) {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)
  const isGameDetail = pathSegments.length > 1

  const getGameTitle = (segment: string) => {
    const game = games.find(g => g.id.toLowerCase() === segment.toLowerCase())
    return game?.title || segment
  }

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
        <Breadcrumb className="px-4 mt-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Beranda</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {!isGameDetail ? (
              <BreadcrumbItem>
                <BreadcrumbPage>Game</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/game">Game</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getGameTitle(pathSegments[1])}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        {children}
      </div>
    </SidebarProvider>
  )
}
