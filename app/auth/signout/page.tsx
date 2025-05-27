"use client"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function SignOutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Sign Out</h1>
      <p className="text-muted-foreground">Are you sure you want to sign out?</p>
      <div className="flex gap-4">
        <Button 
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
