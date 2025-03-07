"use client"

import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react"
import "@livekit/components-styles"
import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { handleCreatorDisconnection } from "@/lib/live-kit-utils"
import { useLiveKitToken } from "@/hooks/use-live-kit-token"
import { LiveKitRoomError } from "./live-kit-room-error"
import { LiveKitRoomLoading } from "./live-kit-room-loading"

const ROOM_HEIGHT = "1000px"
const LIVEKIT_THEME = "default"

interface LiveKitRoomProps {
  roomId: string
  userName: string
  userId: string
  children?: ReactNode
}

export function LiveKitRoomWrapper({ roomId, userName, userId }: LiveKitRoomProps) {
  const { token, error, isLoading } = useLiveKitToken(roomId, userName)
  const router = useRouter()

  if (isLoading) {
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
      data-lk-theme={LIVEKIT_THEME}
      style={{ height: ROOM_HEIGHT }}
      onDisconnected={async () => {
        await handleCreatorDisconnection(roomId, userId)
        router.push("/")
      }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}
