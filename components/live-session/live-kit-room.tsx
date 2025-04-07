"use client"

import { LiveKitRoom, useChat } from "@livekit/components-react"
import { LiveSessionUI } from "./live-session-ui"
import { ReactNode, useEffect, useState } from "react"

interface LiveSession {
  id: string;
  creatorId: string;
  courseId: string;
  name: string;
  description?: string | null;
  scheduledStart: Date;
  scheduledEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  isActive: boolean;
  course: {
    id: string;
    title: string;
    description?: string;
  };
  creator: {
    id: string;
    name: string;
    image: string;
  };
  participants: {
    id: string;
    name: string;
    image: string;
    role?: string;
  }[];
}
import { useRouter } from "next/navigation"
import { handleCreatorDisconnection } from "@/lib/live-kit-utils"
import { useLiveKitToken } from "@/hooks/use-live-kit-token"
import { LiveKitRoomError } from "./live-kit-room-error"
import { LiveKitRoomLoading } from "./live-kit-room-loading"
import { getLiveSessionWithAccess } from "@/app/actions/live-session-actions"

interface LiveKitRoomProps {
  roomId: string
  userName: string
  userId: string
  userRole?: string
  children?: ReactNode
}

function SessionUI({ session }: { session: LiveSession }) {
  const chat = useChat()
  return <LiveSessionUI session={session} chatHook={chat} />
}

export function LiveKitRoomWrapper({ roomId, userName, userId, userRole }: LiveKitRoomProps) {
  const { token, error, isLoading: tokenLoading } = useLiveKitToken(roomId, userName)
  const router = useRouter()
  const [session, setSession] = useState<LiveSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
  interface RawSessionData {
    id: string;
    creatorId: string;
    courseId: number | string;
    name: string;
    description: string | null;
    scheduledStart: string | Date;
    scheduledEnd?: string | Date | null;
    actualStart?: string | Date | null;
    actualEnd?: string | Date | null;
    isActive: boolean;
    course: {
      id: number | string;
      title: string;
      description?: string | null;
    };
    creator: {
      id: string;
      name: string | null;
      image: string | null;
    };
    participants: Array<{
      id: string;
      name: string | null;
      image: string | null;
    }>;
  }

  const transformSession = (data: RawSessionData): LiveSession => {
    return {
      id: data.id,
      creatorId: data.creatorId,
      name: data.name,
      description: data.description,
      scheduledStart: new Date(data.scheduledStart),
      scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
      actualStart: data.actualStart ? new Date(data.actualStart) : undefined,
      actualEnd: data.actualEnd ? new Date(data.actualEnd) : undefined,
      isActive: data.isActive,
      courseId: String(data.courseId),
      course: {
        id: String(data.course.id),
        title: data.course.title,
        description: data.course.description || undefined,
      },
      creator: {
        id: data.creator.id,
        name: data.creator.name || "",
        image: data.creator.image || "",
      },
      participants: data.participants.map((p) => ({
        id: p.id,
        name: p.name || "",
        image: p.image || "",
        role: undefined,  // Will be set for current user when passing to SessionUI
      })),
    }
  }

  const fetchSession = async () => {
    try {
      const data = await getLiveSessionWithAccess(roomId)
      setSession(transformSession(data))
    } catch (error) {
      console.error("Failed to fetch session:", error)
      router.push("/dashboard/live-session") // Redirect to sessions list if access denied
    } finally {
      setIsLoading(false)
    }
  }

    fetchSession()
  }, [roomId, router])

  if (isLoading || tokenLoading) {
    return <LiveKitRoomLoading />
  }

  if (error) {
    return <LiveKitRoomError error={error} />
  }

  if (!token) {
    return null
  }

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ""}
      token={token}
      video={false}
      style={{ height: "100vh", width: "100%" }}
      onDisconnected={async () => {
        await handleCreatorDisconnection(roomId, userId)
        router.push("/")
      }}
    >
      {session && <SessionUI session={{
        ...session,
        participants: session.participants.map(p => ({
          ...p,
          role: p.id === userId ? userRole : p.role
        }))
      }} />}
    </LiveKitRoom>
  )
}
