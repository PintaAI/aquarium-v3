import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LiveSessionList } from "@/components/live-session/live-session-list"
import { CreateLiveSessionForm } from "@/components/live-session/create-live-session-form"
import { db } from "@/lib/db"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Teaching",
  description: "Live teaching sessions",
}

export default async function LiveSessionPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Construct query based on user role
  const sessions = await db.liveSession.findMany({
    where: user.role === "ADMIN" ? undefined : {
      OR: [
        { isActive: true },
        { creatorId: user.id },
        {
          participants: {
            some: { id: user.id }
          }
        }
      ]
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      course: {
        select: {
          id: true,
          title: true,
        }
      },
      participants: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      _count: {
        select: {
          participants: true
        }
      }
    },
    orderBy: {
      scheduledStart: "desc" as const
    }
  })

  // Get courses for create form (only for GURU and ADMIN)
  const courses = (user.role === "GURU" || user.role === "ADMIN") ? 
    await db.course.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: 'asc'
      }
    }) : []

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Live Sessions</h1>
          <p className="text-muted-foreground">
            {user.role === "ADMIN" ? "Manage all live teaching sessions" :
             user.role === "GURU" ? "Create and manage your live teaching sessions" :
             "Join live teaching sessions"}
          </p>
        </div>
        {(user.role === "GURU" || user.role === "ADMIN") && (
          <CreateLiveSessionForm courses={courses} />
        )}
      </div>
      <LiveSessionList sessions={sessions} user={user} />
    </div>
  )
}
