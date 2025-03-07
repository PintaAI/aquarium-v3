"use client"

import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { User, UserRoles } from "@prisma/client"
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
    <div className="space-y-4">
      {sessions.map(session => (
        <div
          key={session.id}
          className="bg-card border rounded-lg p-4 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-medium">
                  {session.name}
                  {session.isActive && (
                    <span className="ml-2 text-sm px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
                      Live
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Course: {session.course.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created by: {session.creator.name || 'Unknown Teacher'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Scheduled: {formatDistanceToNow(new Date(session.scheduledStart), { addSuffix: true })}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{session._count.participants} participants</span>
                  {session.creator.id === user.id && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                      You&apos;re the host
                    </span>
                  )}
                  {session.participants.some(p => p.id === user.id) && !session.isActive && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                      Joined
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {(() => {
                // Is user the creator?
                if (session.creator.id === user.id) {
                  return (
                    <div className="flex gap-2">
                      {/* Manage Button - Always available */}
                      <Button
                        onClick={() => handleEnterSession(session.id, session)}
                        variant="secondary"
                        disabled={joiningSessionId === session.id}
                      >
                        {session.isActive ? "Manage Live Session" : "Manage Session"}
                      </Button>
                      
                      {/* Conditional buttons based on session state */}
                      {session.isActive ? (
                        /* Active session - show End button */
                        <Button
                          onClick={() => handleEndSession(session.id)}
                          variant="destructive"
                          disabled={endingSessionId === session.id}
                        >
                          {endingSessionId === session.id ? "Ending..." : "End Session"}
                        </Button>
                      ) : (
                        /* Inactive session - show Start and Delete buttons */
                        <>
                          <Button
                            onClick={() => handleStartSession(session.id)}
                            variant="default"
                            disabled={startingSessionId === session.id}
                          >
                            {startingSessionId === session.id ? "Starting..." : "Start Session"}
                          </Button>
                          <Button
                            onClick={() => handleDeleteSession(session.id)}
                            variant="destructive"
                            disabled={deletingSessionId === session.id}
                          >
                            {deletingSessionId === session.id ? "Deleting..." : "Delete"}
                          </Button>
                        </>
                      )}
                    </div>
                  )
                }
                
                // Is session active?
                if (session.isActive) {
                  return (
                    <Button
                      onClick={() => handleEnterSession(session.id, session)}
                      variant="default"
                      disabled={joiningSessionId === session.id}
                    >
                      {joiningSessionId === session.id ? "Joining..." : "Join Live Now"}
                    </Button>
                  )
                }
                
                // Has user already joined?
                if (session.participants.some(p => p.id === user.id)) {
                  return (
                    <Button variant="outline" disabled>
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
                  >
                    {joiningSessionId === session.id ? "Joining..." : "Join Session"}
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
