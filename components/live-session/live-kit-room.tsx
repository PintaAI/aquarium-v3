"use client"

import { LiveKitRoom, useChat } from "@livekit/components-react"
import { LiveSessionUI } from "./live-session-ui"
import { ReactNode, useEffect, useState } from "react"
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
  children?: ReactNode
}

function SessionUI({ session }: { session: any }) {
  const chat = useChat()
  return <LiveSessionUI session={session} chatHook={chat} />
}

export function LiveKitRoomWrapper({ roomId, userName, userId }: LiveKitRoomProps) {
  const { token, error, isLoading: tokenLoading } = useLiveKitToken(roomId, userName)
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getLiveSessionWithAccess(roomId)
        setSession(data)
      } catch (error) {
        console.error("Failed to fetch session:", error)
        router.push("/dashboard/live-session") // Redirect to sessions list if access denied
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [roomId])

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
      audio={false}
      video={false}
      style={{ height: "100vh", width: "100%" }}
      onDisconnected={async () => {
        await handleCreatorDisconnection(roomId, userId)
        router.push("/")
      }}
    >
      <SessionUI session={session} />
    </LiveKitRoom>
  )
}
