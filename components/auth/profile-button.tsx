"use client"

import { Button } from "../ui/button"
import { ReactNode } from "react"
import Link from "next/link"

interface ProfileButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  icon?: ReactNode
}

export function ProfileButton({ variant = "ghost", className, icon }: ProfileButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      className={className}
    >
      <Link href="/profil">
        {icon}
        Profile
      </Link>
    </Button>
  )
}
