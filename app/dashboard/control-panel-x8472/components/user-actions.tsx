"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { UserCog, MoreVertical, CreditCard } from "lucide-react"
import { updateUserRole, updateUserPlan } from "../actions"

interface UserActionsProps {
  user: {
    id: string
    role: string
    plan: string
  }
}

export function UserActions({ user }: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Role Management */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserCog className="mr-2 h-4 w-4" />
            Change Role
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={async () => {
                try {
                  await updateUserRole(user.id, "USER")
                } catch (error) {
                  console.error("Failed to update role:", error)
                }
              }}>
                User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                try {
                  await updateUserRole(user.id, "GURU")
                } catch (error) {
                  console.error("Failed to update role:", error)
                }
              }}>
                Guru
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                try {
                  await updateUserRole(user.id, "MURID")
                } catch (error) {
                  console.error("Failed to update role:", error)
                }
              }}>
                Murid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                try {
                  await updateUserRole(user.id, "ADMIN")
                } catch (error) {
                  console.error("Failed to update role:", error)
                }
              }}>
                Admin
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Plan Management */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CreditCard className="mr-2 h-4 w-4" />
            Change Plan
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={async () => {
                try {
                  await updateUserPlan(user.id, "FREE")
                } catch (error) {
                  console.error("Failed to update plan:", error)
                }
              }}>
                Free Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                try {
                  await updateUserPlan(user.id, "PREMIUM")
                } catch (error) {
                  console.error("Failed to update plan:", error)
                }
              }}>
                Premium Plan
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem>View profile</DropdownMenuItem>
        <DropdownMenuItem>Send email</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          Suspend user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
