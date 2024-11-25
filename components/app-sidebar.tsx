"use client"

import * as React from "react"
import { Book, GamepadIcon, Newspaper, User, BookOpen, Command } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { getJoinedCourses } from "@/actions/course-actions"

import { NavUser } from "./nav-user"
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

const data = {
  navMain: [
    {
      title: "Kursus",
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
      title: "Kamus",
      url: "/vocabulary",
      icon: BookOpen,
      isActive: false,
    },
  ],
  gameList: [
    {
      name: "Advanced Translate",
      description: "Latihan menerjemahkan kalimat bahasa Korea",
      path: "/game/advanced-translate"
    },
    {
      name: "EPS-TOPIK", 
      description: "Latihan soal EPS-TOPIK",
      path: "/game/eps-topik"
    },
    {
      name: "Hangeul",
      description: "Belajar menulis huruf Korea",
      path: "/game/hangeul"
    },
    {
      name: "Pronounce",
      description: "Latihan pengucapan bahasa Korea",
      path: "/game/pronounce"
    },
    {
      name: "Toro-toro",
      description: "Game tebak kata bahasa Korea",
      path: "/game/toro-toro"
    }
  ]
}

interface Course {
  id: number;
  title: string;
  modules: {
    id: number;
    order: number;
    title: string;
  }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { setOpen } = useSidebar()
  const [joinedCourses, setJoinedCourses] = React.useState<Course[]>([])

  // Fetch joined courses when component mounts
  React.useEffect(() => {
    const fetchJoinedCourses = async () => {
      const courses = await getJoinedCourses()
      setJoinedCourses(courses)
    }
    fetchJoinedCourses()
  }, [])

  // Menentukan item aktif berdasarkan pathname
  const activeNavItem = React.useMemo(() => {
    return data.navMain.find(item => pathname.startsWith(item.url)) || data.navMain[0]
  }, [pathname])

  // Menentukan konten sidebar berdasarkan pathname
  const renderSidebarContent = () => {
    if (pathname.startsWith('/game')) {
      return data.gameList.map((game) => (
        <Link
          href={game.path}
          key={game.name}
          className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex w-full items-center gap-2">
            <span className="font-medium">{game.name}</span>
          </div>
          <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
            {game.description}
          </span>
        </Link>
      ))
    }

    if (pathname.startsWith('/courses')) {
      if (joinedCourses.length === 0) {
        return (
          <div className="p-4 text-sm text-muted-foreground">
            Anda belum bergabung dengan kursus apapun
          </div>
        )
      }

      return joinedCourses.map((course) => (
        <Link
          href={`/courses/${course.id}/modules/${course.modules[0]?.id || 1}`}
          key={course.id}
          className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex w-full items-center gap-2">
            <span className="font-medium">{course.title}</span>
          </div>
          <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
            {course.modules.length} modul
          </span>
        </Link>
      ))
    }

    // Konten default ketika tidak ada konten spesifik
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
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
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
                        setOpen(true)
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

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeNavItem.title}
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
