"use client"

import * as React from "react"
import {
  BookOpen,
  GalleryVerticalEnd,
  Home,
  GamepadIcon,
  NewspaperIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UseCurrentUser } from "@/hooks/use-current-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userData = UseCurrentUser()

  if (!userData) {
    return <div>Loading...</div>
  }

  const data = {
    user: {
      name: userData.name || "Unknown",
      email: userData.email || "no-email@example.com",
      avatar: userData.image || "/avatars/default.jpg",
    },
    teams: [
      {
        name: "Pejuangkorea Academy",
        logo: () => <img src="/images/logoo.png" alt="Pejuangkorea Logo" />,
        plan: "Enterprise",
      }
    ],
    navMain: [
      {
        title: "Home",
        url: "/",
        icon: Home,
      },
      {
        title: "Courses",
        url: "/courses",
        icon: BookOpen,
      },
      {
        title: "Games",
        url: "/game",
        icon: GamepadIcon,
      },
      {
        title: "Articles",
        url: "/artikel",
        icon: NewspaperIcon,
      },
 
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
