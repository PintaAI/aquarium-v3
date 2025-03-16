"use client"

import * as React from "react"
import { Book, GamepadIcon, Newspaper, BookOpen, ChevronsLeft, PencilRuler } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { CourseSidebarContent } from "./sidebar/course-sidebar-content"
import { VocabularySidebarContent } from "./sidebar/vocabulary-sidebar-content"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"
import { NavUser } from "./nav-user"

const data = {
  navMain: [
    {
      title: "Kursus mu",
      url: "/courses",
      icon: Book,
      isActive: false,
    },
    {
      title: "Game",
      url: "/game",
      icon: GamepadIcon,
      isActive: false,
    },
    {
      title: "Artikel",
      url: "/artikel",
      icon: Newspaper,
      isActive: false,
    },
    {
      title: "Kosa-kata",
      url: "/vocabulary",
      icon: BookOpen,
      isActive: false,
    },
    {
      title: "Soal",
      url: "/soal",
      icon: PencilRuler,
      isActive: false,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setOpen, open } = useSidebar()
  const [initialPathLoaded, setInitialPathLoaded] = React.useState(false)

  // Set sidebar closed by default for game and artikel routes only on initial load
  React.useEffect(() => {
    if (!initialPathLoaded && (pathname === '/' || pathname.startsWith('/game') || pathname.startsWith('/artikel') || pathname.startsWith('/soal'))) {
      setOpen(false)
      setInitialPathLoaded(true)
    }
  }, [pathname, setOpen, initialPathLoaded])

  // Reset initialPathLoaded when route changes to non-game/artikel
  React.useEffect(() => {
    if (!pathname.startsWith('/game') && !pathname.startsWith('/artikel') && !pathname.startsWith('/soal')) {
      setInitialPathLoaded(false)
    }
  }, [pathname])

  // Menentukan item aktif berdasarkan pathname
  const activeNavItem = React.useMemo(() => {
    return data.navMain.find(item => pathname.startsWith(item.url)) || data.navMain[0]
  }, [pathname])

  const handleIconClick = (url: string) => {
    // Toggle sidebar jika mengklik icon yang aktif
    if (pathname.startsWith(url)) {
      setOpen(!open)
    }
  }

  // Menentukan konten sidebar berdasarkan pathname
  const renderSidebarContent = () => {


    if (pathname.startsWith('/courses')) {
      return <CourseSidebarContent />
    }

    if (pathname.startsWith('/vocabulary')) {
      return <VocabularySidebarContent />
    }

    return (
      <div className="p-4 text-sm text-muted-foreground">
        Pilih menu untuk melihat konten
      </div>
    )
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <Image 
                      src="/images/circle-logo.png"
                      alt="Aquarium Logo"
                      width={32}
                      height={32}
                      className="size-8"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Aquarium</span>
                    <span className="truncate text-xs">Belajar Bahasa Korea</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        handleIconClick(item.url)
                      }}
                      isActive={pathname.startsWith(item.url)}
                      className="px-2.5 md:px-2"
                      asChild
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      <Sidebar 
        collapsible="none" 
        className={`hidden flex-1 md:flex ${pathname === '/' || pathname.startsWith('/game') || pathname.startsWith('/artikel') || pathname.startsWith('/soal') ? '!hidden' : ''}`}
      >
        <SidebarHeader className="border-b">
          <div className="flex items-center justify-between px-1  py-0">
            <div className="flex items-center gap-3">
              {activeNavItem && (
                <>
                  <activeNavItem.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-medium">{activeNavItem.title}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setOpen(!open)}
                className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md"
                aria-label="Toggle sidebar"
              >
                <ChevronsLeft className={`h-4 w-4 transition-transform ${!open ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {renderSidebarContent()}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
