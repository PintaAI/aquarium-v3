"use client"

import { signOut } from "next-auth/react"
import { Button } from "../ui/button"
import { ReactNode } from "react"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  icon?: ReactNode
}

export function SignOutButton({ variant = "ghost", className, icon }: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
    })
  }

  return (
    <Button
      onClick={handleSignOut}
      variant={variant}
      className={className}
    >
      {icon}
      Sign out
    </Button>
  )
}
