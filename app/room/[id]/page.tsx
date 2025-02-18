"use client"

import { useEffect, useState } from "react"
import { Track } from "livekit-client"
import { 
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  useParticipants,
  useLocalParticipant,
  VideoTrack,
  ConnectionStateToast,
  RoomName,
  TrackRefContext,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { UseCurrentUser as useCurrentUser } from "@/hooks/use-current-user"
import { endRoom, getRoomById } from "@/actions/room-actions"
import { useRouter } from "next/navigation"
import { use } from "react"

function RoomHeader({ room }: { room: any }) {
  const participants = useParticipants()
  
  return (
    <div className="absolute top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-10 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{room.name}</h1>
            <p className="text-muted-foreground">Course: {room.course.title}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {participants.length} watching
          </div>
        </div>
      </div>
    </div>
  )
}

function MyVideoConference({ room, user }: { room: any; user: any }) {
  const isGuru = user?.id === room.creatorId

  // Get screen share tracks
  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ])

  // Only get camera if user is GURU
  const videoTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: isGuru }
  ])

  return (
    <div className="relative h-full">
      <RoomHeader room={room} />
      <div className="pt-20 px-4 pb-16 h-full">
        {screenShareTracks.length > 0 ? (
          // If there's a screen share, show it as main content
          <div className="grid grid-cols-1 gap-4 h-full">
            {screenShareTracks.map((track) => (
              <div key={track.publication?.trackSid} className="w-full h-full">
                {track.publication && (
                  <VideoTrack 
                    trackRef={track} 
                    controls={true}
                  />
                )}
              </div>
            ))}
            {isGuru && videoTracks.length > 0 && (
              <div className="absolute bottom-20 right-4 w-48 aspect-video">
                <TrackRefContext.Provider value={videoTracks[0]}>
                  <ParticipantTile />
                </TrackRefContext.Provider>
              </div>
            )}
          </div>
        ) : (
          // If no screen share, only show GURU's video if available
          <div className="flex items-center justify-center h-full">
            {isGuru && videoTracks.length > 0 ? (
              <div className="max-w-3xl w-full aspect-video">
                <TrackRefContext.Provider value={videoTracks[0]}>
                  <ParticipantTile />
                </TrackRefContext.Provider>
              </div>
            ) : (
              <div className="text-muted-foreground text-center">
                <p>Waiting for GURU to share content...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function RoomPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const user = useCurrentUser()
  const [token, setToken] = useState("")
  const [error, setError] = useState<string>()
  const [room, setRoom] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const roomData = await getRoomById(id)
        
        if (!roomData) {
          setError("Room not found")
          return
        }

        if (!roomData.isActive) {
          setError("This room is no longer active")
          return
        }

        const isParticipant = roomData.participants.some(p => p.id === user?.id)
        const isCreator = roomData.creatorId === user?.id

        if (!isParticipant && !isCreator) {
          router.push("/room")
          return
        }

        setRoom(roomData)

        // Get token for video conference
        const resp = await fetch(
          `/api/token?room=${id}&username=${user?.name || user?.email}`
        )
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        setError("Failed to join room")
        console.error(e)
      }
    }

    if (user) {
      init()
    }
  }, [id, user, router])

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        </div>
      </div>
    )
  }

  if (!token || !room) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl">Joining room...</h1>
        </div>
      </div>
    )
  }

  const isGuru = user?.id === room.creatorId

  return (
    <div className="h-screen bg-background">
      <LiveKitRoom
        video={isGuru}
        audio={isGuru}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: "100vh" }}
        onDisconnected={async () => {
          // If GURU leaves, end the room
          if (room.creatorId === user?.id) {
            await endRoom(id)
          }
          router.push("/room")
        }}
      >
        <MyVideoConference room={room} user={user} />
        <RoomAudioRenderer />
        {isGuru ? (
          <ControlBar className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-3" />
        ) : (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-3 flex justify-end">
            <button onClick={() => router.push("/room")} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm">
              Leave
            </button>
          </div>
        )}
        <ConnectionStateToast />
      </LiveKitRoom>
    </div>
  )
}
