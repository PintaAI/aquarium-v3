"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

export function ProfileSection() {
  const { session, isLoading } = useAuth({ required: true })
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString())
  }, [session])

  if (isLoading) {
    return (
      <section className="rounded-lg border p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-1/3"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="font-semibold mb-2">Live Profile Data</h2>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>Email: {session?.user?.email}</p>
        <p>Role: {session?.user?.role}</p>
        <p>ID: {session?.user?.id}</p>
        <p className="text-xs">Last updated: {lastUpdated}</p>
      </div>
    </section>
  )
}
