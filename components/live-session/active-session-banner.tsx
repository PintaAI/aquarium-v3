"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Session {
  id: string
  name: string
  course: {
    title: string
  }
  isActive: boolean
}

async function getActiveSessions(): Promise<Session[]> {
  try {
    const response = await fetch("/api/live-sessions/active", {
      cache: "no-store" // Use only no-store for truly dynamic data
    })
    
    if (!response.ok) {
      console.error(`[ActiveSessions] Error: ${response.status} ${response.statusText}`)
      return []
    }
    
    const data = await response.json()
    console.log("[ActiveSessions] Received:", data)
    return data.activeSessions || []
  } catch (error) {
    console.error("[ActiveSessions] Error:", error)
    return []
  }
}

export function ActiveLiveSessionBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Create animation effect by toggling visibility
    const interval = setInterval(() => {
      setIsVisible(prev => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check for active sessions
    const checkSessions = async () => {
      const sessions = await getActiveSessions()
      console.log("[ActiveSessions] Found sessions:", sessions.length)
      // Since we're already filtering for active sessions in the API,
      // we can just take the first one
      setSession(sessions.length > 0 ? sessions[0] : null)
    }

    // Initial check
    checkSessions()
    
    // Set up polling
    const interval = setInterval(checkSessions, 15000) // Check more frequently (15 seconds)

    return () => clearInterval(interval)
  }, [])

  if (!session) return null

  return (
    <Link 
      href={`/dashboard/live-session/${session.id}`}
      className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10 transition-all border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3 group"
    >
      <div className="relative">
        <div className={cn(
          "w-3 h-3 rounded-full bg-emerald-500",
          "transition-opacity duration-1000",
          isVisible ? "opacity-100" : "opacity-50"
        )} />
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
      </div>
      <div className="flex-1 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee">
          Live Session: {session.name} - {session.course.title}
        </div>
      </div>
    </Link>
  )
}
