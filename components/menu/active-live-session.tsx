"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Users } from "lucide-react"
import { joinRoom } from "@/actions/room-actions"
import { useRouter } from "next/navigation"

interface Room {
  id: string
  title: string
  createdAt: Date
  host: {
    name: string | null
    image: string | null
  }
  numParticipants: number
}

interface ActiveLiveSessionProps {
  rooms: Room[]
  isLoading?: boolean
}

export function ActiveLiveSession({ rooms, isLoading = false }: ActiveLiveSessionProps) {
  const router = useRouter()

  const handleJoinRoom = async (e: React.MouseEvent<HTMLAnchorElement>, roomId: string) => {
    e.preventDefault()
    try {
      await joinRoom({ roomId })
      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error("Failed to join room:", error)
    }
  }

  if (isLoading || rooms.length === 0) return null

  return (
    <div className="w-full bg-muted/30 border rounded-lg overflow-hidden">
      <div className="relative w-full flex items-center gap-2 px-3 py-2">
        {/* Online Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <Badge variant="secondary" className="text-xs">LIVE</Badge>
        </div>

        {/* Marquee Effect */}
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_20s_linear_infinite] inline-block">
            {rooms.map((room, index) => (
              <Link
                key={room.id}
                href={`/room/${room.id}`}
                onClick={(e) => handleJoinRoom(e, room.id)}
                className="inline-flex items-center gap-2 mr-8"
              >
                <span className="text-sm font-medium truncate">
                  {room.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({room.numParticipants} <Users className="inline h-3 w-3" />)
                </span>
              </Link>
            ))}
          </div>
          <div className="animate-[marquee_20s_linear_infinite] inline-block">
            {rooms.map((room, index) => (
              <Link
                key={`${room.id}-duplicate`}
                href={`/room/${room.id}`}
                onClick={(e) => handleJoinRoom(e, room.id)}
                className="inline-flex items-center gap-2 mr-8"
              >
                <span className="text-sm font-medium truncate">
                  {room.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({room.numParticipants} <Users className="inline h-3 w-3" />)
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <Link href="/room" className="shrink-0">
          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
            View All
          </Badge>
        </Link>
      </div>
    </div>
  )
}
