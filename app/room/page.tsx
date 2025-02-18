import { getRooms, getLiveSessions } from "@/actions/room-actions"
import { CreateRoomForm } from "@/components/room/create-room-form"
import { ActiveLiveSession } from "@/components/menu/active-live-session"
import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { LiveSessionList } from "@/components/room/live-session-list"

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

        <div className="space-y-8">
          <div>
            <LiveSessionList />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Database Records</h2>
            <ActiveLiveSession rooms={liveSessions.map(room => ({
              id: room.id,
              title: room.name,
              createdAt: room.createdAt,
              host: {
                name: room.creator.name,
                image: room.creator.image
              },
              numParticipants: room.numParticipants || 0
            }))} />
          </div>
        </div>


      </div>
    </div>
  )
}
