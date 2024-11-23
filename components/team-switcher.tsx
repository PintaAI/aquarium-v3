"use client"

import * as React from "react"
import { ChevronsUpDown, Crown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"
import { UseCurrentUser } from "../hooks/use-current-user"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function TeamSwitcher() {
  const { isMobile, toggleSidebar } = useSidebar()
  const userData = UseCurrentUser()

  if (!userData) {
    return null
  }

  const teams = [
    {
      name: userData.name || "Unknown",
      logo: () => (
        <Avatar className="size-full">
          <AvatarImage src={userData.image || undefined} />
          <AvatarFallback>{userData.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
      ),
      plan: userData.plan === "PREMIUM" ? "Premium" : "Free",
      role: userData.role === "GURU" ? "Guru" : "Murid"
    }
  ]

  const [activeTeam] = React.useState(teams[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleSidebar}
            className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary dark:bg-secondary text-primary"
          >
            <activeTeam.logo />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeTeam.name}
                  </span>
                  <span className="truncate text-xs">
                    {activeTeam.role} • {activeTeam.plan}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Status Anda
              </DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <activeTeam.logo />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{activeTeam.role}</span>
                  <span className="text-xs text-muted-foreground">{activeTeam.plan}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {userData.plan === "FREE" && (
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Crown className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Upgrade ke Premium</div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
