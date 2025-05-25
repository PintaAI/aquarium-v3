"use client"

import { signOut, useSession } from "next-auth/react"
import { ButtonHTMLAttributes } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

const baseStyles = ""

export function AuthButton({ className, ...props }: AuthButtonProps) {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button
        onClick={() => signOut({ callbackUrl: "/" })}
        variant="destructive"
        className={cn(baseStyles, className)}
        {...props}
      >
        Sign out
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className={cn(baseStyles, className)}
      {...props}
    >
      Login
    </Button>
  )
}
