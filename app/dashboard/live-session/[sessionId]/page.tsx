import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getLiveSessionWithAccess, joinLiveSession } from "@/app/actions/live-session-actions"
import { LiveKitRoomWrapper } from "@/components/live-session/live-kit-room"
import { db } from "@/lib/db"
import { Metadata } from "next"

interface LiveSessionPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export const metadata: Metadata = {
  title: "Live Session",
  description: "Join live teaching session"
}

export default async function LiveSessionPage(props: LiveSessionPageProps) {
  const params = await props.params;
  const user = await currentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Validate sessionId parameter
  const sessionId = params?.sessionId
  if (!sessionId) {
    redirect("/dashboard/live-session")
  }

  try {
    // First check if session exists and user's relationship to it
    const session = await db.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        },
        participants: {
          where: { id: user.id },
          select: { id: true }
        }
      }
    })

    if (!session) {
      redirect("/dashboard/live-session")
    }

    // Check user access
    const isCreator = session.creator.id === user.id
    const isAdmin = user.role === "ADMIN"
    const isParticipant = session.participants.length > 0
    
    // If user is not creator, admin, or participant, try to join
    if (!isCreator && !isAdmin && !isParticipant) {
      try {
        await joinLiveSession(sessionId)
      } catch (error) {
        console.error("Failed to join session:", error)
        redirect("/dashboard/live-session")
      }
    }
    
    // Now get full session access (this will throw an error if user doesn't have access)
    let sessionWithAccess;
    try {
      sessionWithAccess = await getLiveSessionWithAccess(sessionId)
    } catch (error) {
      console.error("Access denied:", error)
      redirect("/dashboard/live-session")
    }
    
    return (
      <div className="h-screen pb-6 md:pb-0">
      <LiveKitRoomWrapper
        roomId={sessionWithAccess.id}
        userName={user.name || user.id}
        userId={user.id}
      />
      </div>
    )
  } catch (error) {
    console.error("Session access error:", error)
    redirect("/dashboard/live-session")
  }
}
