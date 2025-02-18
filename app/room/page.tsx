import { getRooms, getLiveSessions } from "@/actions/room-actions"
import { RoomCard } from "@/components/room/room-card"
import { CreateRoomForm } from "@/components/room/create-room-form"
import { ActiveLiveSession } from "@/components/menu/active-live-session"
import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function RoomPage() {
  const [user, rooms, liveSessions] = await Promise.all([
    currentUser(),
    getRooms(),
    getLiveSessions()
  ])

  // Get all available courses
  const courses = user?.role === "GURU" ? await db.course.findMany() : []

  return (
    <div className="container py-6">
      <div className="space-y-6">
        {user?.role === "GURU" && (
          <CreateRoomForm courses={courses} />
        )}

        <ActiveLiveSession rooms={liveSessions.map(room => ({
          id: room.id,
          title: room.name,
          createdAt: room.createdAt,
          host: {
            name: room.creator.name,
            image: room.creator.image
          }
        }))} />


      </div>
    </div>
  )
}
