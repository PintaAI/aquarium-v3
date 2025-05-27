"use client"

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle
} from "@/components/ui/drawer"
import AuthCard from "@/components/auth/auth-card"
import { AuthButton } from "@/components/auth/auth-button"
import { useSession } from "next-auth/react"

export function AuthDrawer() {
  const { data: session } = useSession()

  if (session) {
    return <AuthButton />
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <AuthButton />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="text-center pt-4">Sign in</DrawerTitle>
        <div className="mx-auto w-full max-w-sm p-4">
          <AuthCard />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
