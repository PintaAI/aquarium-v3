"use client"


import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Marquee from "react-fast-marquee"

interface Session {
  id: string
  name: string
  course: {
    title: string
  }
  isActive: boolean
}

async function getActiveSessions(signal?: AbortSignal): Promise<Session[]> {
  try {
    const response = await fetch("/api/live-sessions/active", {
      cache: "no-store", // Use only no-store for truly dynamic data
      signal // Pass the abort signal to the fetch request
    })
    
    if (!response.ok) {
      console.error(`[ActiveSessions] Error: ${response.status} ${response.statusText}`)
      return []
    }
    
    const data = await response.json()
    console.log("[ActiveSessions] Received:", data)
    return data.activeSessions || []
  } catch (error) {
    // Don't log aborted requests as errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('[ActiveSessions] Request aborted')
      return []
    }
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
    // Track if component is mounted
    let isMounted = true;
    // Create an AbortController for cancelling in-flight requests
    const controller = new AbortController();
    // Track poll count
    let pollCount = 0;
    // Track timeout ID for cleanup
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Check for active sessions
    const checkSessions = async () => {
      try {
        pollCount++;
        console.log("[ActiveSessions] Poll attempt:", pollCount);
        
        const sessions = await getActiveSessions(controller.signal);
        console.log("[ActiveSessions] Found sessions:", sessions.length);
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Since we're already filtering for active sessions in the API,
          // we can just take the first one
          setSession(sessions.length > 0 ? sessions[0] : null);
          
          // Schedule next poll if under 10 attempts
          if (pollCount < 10) {
            timeoutId = setTimeout(checkSessions, 15000);
          } else {
            console.log("[ActiveSessions] Reached max polls, stopping");
          }
        }
      } catch (error) {
        // Error handling is done in getActiveSessions
        // Still try to schedule next poll on error if under 10 attempts
        if (isMounted && pollCount < 10) {
          timeoutId = setTimeout(checkSessions, 15000);
        }
      }
    }

    // Initial check
    checkSessions();

    // Cleanup function
    return () => {
      // Mark component as unmounted
      isMounted = false;
      // Cancel any in-flight requests
      controller.abort();
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

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
      <div className="flex-1">
        <Marquee
          direction="right"
          speed={40}
          pauseOnHover
        >
          Live Session: {session.name} - {session.course.title}
        </Marquee>
      </div>
    </Link>
  )
}
