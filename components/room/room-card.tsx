"use client"

import { Room, Course, User } from "@prisma/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { joinRoom } from "@/actions/room-actions"
import { UseCurrentUser as useCurrentUser } from "@/hooks/use-current-user"

interface RoomWithRelations extends Room {
  creator: User
  course: Course
  participants: User[]
}

interface RoomCardProps {
  room: RoomWithRelations
}

export const RoomCard = ({ room }: RoomCardProps) => {
  const router = useRouter()
  const user = useCurrentUser()

  const isCreator = user?.id === room.creatorId
  const hasJoined = room.participants.some(participant => participant.id === user?.id)

  const onJoin = async () => {
    try {
      await joinRoom({ roomId: room.id })
      router.push(`/room/${room.id}`)
    } catch (error) {
      console.error(error)
    }
  }

  const onEnter = () => {
    router.push(`/room/${room.id}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
        <CardDescription>
          Course: {room.course.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {room.description}
        </div>
        <div className="mt-2 text-sm">
          Created by: {room.creator.name || room.creator.email}
        </div>
        <div className="mt-1 text-sm">
          Participants: {room.participants.length}
        </div>
      </CardContent>
      <CardFooter>
        {!hasJoined && !isCreator ? (
          <Button onClick={onJoin}>Join Room</Button>
        ) : (
          <Button onClick={onEnter}>Enter Room</Button>
        )}
      </CardFooter>
    </Card>
  )
}
