"use client"

import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { UserRoles } from "@prisma/client"
import { useState } from "react"
import { joinLiveSession, endLiveSession, deleteLiveSession, startLiveSession } from "@/app/actions/live-session-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Creator {
  id: string
  name: string | null
  image: string | null
}

interface Course {
  id: number
  title: string
}

interface Participant {
  id: string
  name: string | null
  image: string | null
}

interface Session {
  id: string
  name: string
  isActive: boolean
  scheduledStart: Date
  scheduledEnd: Date | null
  actualStart: Date | null
  actualEnd: Date | null
  creator: Creator
  course: Course
  participants: Participant[]
  _count: {
    participants: number
  }
}

interface LiveSessionListProps {
  sessions: Session[]
  user: {
    id: string
    role: UserRoles
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

export function LiveSessionList({ sessions, user }: LiveSessionListProps) {
  const router = useRouter()
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null)
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null)
  const [endingSessionId, setEndingSessionId] = useState<string | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  if (!sessions.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No live sessions available
      </div>
    )
  }

  const handleJoin = async (sessionId: string) => {
    try {
      setJoiningSessionId(sessionId)
      await joinLiveSession(sessionId)
      toast.success("Successfully joined the session")
      
      // Small delay to show the success message
      setTimeout(() => {
        router.push(`/dashboard/live-session/${sessionId}`)
      }, 500)
    } catch (error) {
      console.error("Failed to join session:", error)
      toast.error(error instanceof Error ? error.message : "Failed to join session. Please try again.")
    } finally {
      setJoiningSessionId(null)
    }
  }

  const handleStartSession = async (sessionId: string) => {
    try {
      setStartingSessionId(sessionId)
      await startLiveSession(sessionId)
      toast.success("Session started successfully")
      
      // Small delay to show the success message
      setTimeout(() => {
        router.push(`/dashboard/live-session/${sessionId}`)
      }, 500)
    } catch (error) {
      console.error("Failed to start session:", error)
      toast.error(error instanceof Error ? error.message : "Failed to start session")
    } finally {
      setStartingSessionId(null)
    }
  }

  const handleEndSession = async (sessionId: string) => {
    try {
      setEndingSessionId(sessionId)
      await endLiveSession(sessionId)
      toast.success("Session ended successfully")
      router.refresh()
    } catch (error) {
      console.error("Failed to end session:", error)
      toast.error(error instanceof Error ? error.message : "Failed to end session")
    } finally {
      setEndingSessionId(null)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setDeletingSessionId(sessionId)
      await deleteLiveSession(sessionId)
      toast.success("Session deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Failed to delete session:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete session")
    } finally {
      setDeletingSessionId(null)
    }
  }

  const handleEnterSession = async (sessionId: string, currentSession: Session) => {
    setJoiningSessionId(sessionId)
    try {
      // For non-creators/non-admins, we need to ensure they're joined
      // For creators and admins, the joinLiveSession function handles this gracefully
      if (currentSession.creator.id !== user.id && user.role !== "ADMIN") {
        try {
          await joinLiveSession(sessionId)
        } catch (error) {
          // If it's already joined, this is fine
          console.log("Join attempt:", error)
        }
      }
      router.push(`/dashboard/live-session/${sessionId}`)
    } catch (error) {
      console.error("Failed to enter session:", error)
      toast.error("Failed to enter session. Please try again.")
    } finally {
      setJoiningSessionId(null)
    }
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map(session => (
        <div
          key={session.id}
          className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
        >
          {/* Gradient Background with Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl transform rotate-45" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              {session.isActive && (
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse duration-1000" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="relative p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors pr-2">
                {session.name}
              </h3>
              {session.isActive && (
                <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {/* Info Box */}
            <div className="space-y-2 bg-muted/30 backdrop-blur-sm rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path>
                </svg>
                <span className="truncate">{session.course.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M18 21v-2a4 4 0 00-4-4H10a4 4 0 00-4 4v2"></path>
                </svg>
                <span className="truncate">{session.creator.name || 'Unknown Teacher'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{formatDistanceToNow(new Date(session.scheduledStart), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-full text-xs font-medium">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {session._count.participants} participants
              </span>
              {session.creator.id === user.id && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  Host
                </span>
              )}
              {session.participants.some(p => p.id === user.id) && !session.isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Joined
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {(() => {
                // Is user the creator?
                if (session.creator.id === user.id) {
                  return (
                    <>
                      {/* Manage Button - Always available */}
                      <Button
                        onClick={() => handleEnterSession(session.id, session)}
                        variant="secondary"
                        disabled={joiningSessionId === session.id}
                        className="flex-1 shadow-sm hover:shadow-md"
                      >
                        {session.isActive ? "Manage Live" : "Manage"}
                      </Button>
                      
                      {/* Conditional buttons based on session state */}
                      {session.isActive ? (
                        /* Active session - show End button */
                        <Button
                          onClick={() => handleEndSession(session.id)}
                          variant="destructive"
                          disabled={endingSessionId === session.id}
                          className="flex-1 shadow-sm hover:shadow-md"
                        >
                          {endingSessionId === session.id ? "Ending..." : "End"}
                        </Button>
                      ) : (
                        /* Inactive session - show Start and Delete buttons */
                        <>
                          <Button
                            onClick={() => handleStartSession(session.id)}
                            variant="default"
                            disabled={startingSessionId === session.id}
                            className="flex-1 shadow-sm hover:shadow-md"
                          >
                            {startingSessionId === session.id ? "Starting..." : "Start"}
                          </Button>
                          <Button
                            onClick={() => handleDeleteSession(session.id)}
                            variant="destructive"
                            disabled={deletingSessionId === session.id}
                            className="flex-1 shadow-sm hover:shadow-md"
                          >
                            {deletingSessionId === session.id ? "..." : "Delete"}
                          </Button>
                        </>
                      )}
                    </>
                  )
                }
                
                // Is session active?
                if (session.isActive) {
                  return (
                    <Button
                      onClick={() => handleEnterSession(session.id, session)}
                      variant="default"
                      disabled={joiningSessionId === session.id}
                      className="w-full shadow-sm hover:shadow-md"
                    >
                      {joiningSessionId === session.id ? "Joining..." : "Join Live"}
                    </Button>
                  )
                }
                
                // Has user already joined?
                if (session.participants.some(p => p.id === user.id)) {
                  return (
                    <Button variant="outline" disabled className="w-full opacity-60">
                      Waiting for Start
                    </Button>
                  )
                }
                
                // Default: Allow joining
                return (
                  <Button
                    onClick={() => handleJoin(session.id)}
                    variant="outline"
                    disabled={joiningSessionId === session.id}
                    className="w-full shadow-sm hover:shadow-md"
                  >
                    {joiningSessionId === session.id ? "Joining..." : "Join"}
                  </Button>
                )
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
