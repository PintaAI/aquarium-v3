import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LiveSessionList } from "@/components/live-session/live-session-list"
import { CreateLiveSessionForm } from "@/components/live-session/create-live-session-form"
import { db } from "@/lib/db"
import { Metadata } from "next"
import { UserRoles } from "@prisma/client"

export const metadata: Metadata = {
  title: "Live Teaching",
  description: "Live teaching sessions",
}

export default async function LiveSessionPage() {
  const userData = await currentUser()

  if (!userData) {
    redirect("/auth/login")
  }
  
  // Ensure user has the required role property for the LiveSessionList component
  const user = {
    id: userData.id,
    role: (userData.role as UserRoles) || UserRoles.MURID,
    name: userData.name,
    email: userData.email,
    image: userData.image
  }

  // Construct query based on user role
  const sessions = await db.liveSession.findMany({
    where: user.role === UserRoles.ADMIN ? undefined : {
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
  const courses = (user.role === UserRoles.GURU || user.role === UserRoles.ADMIN) ? 
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
    <div className="min-h-screen  py-8 space-y-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-background rounded-lg border p-6 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Live Sessions</h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            {user.role === UserRoles.ADMIN ? "Manage all live teaching sessions" :
             user.role === UserRoles.GURU ? "Create and manage your live teaching sessions" :
             "Join live teaching sessions"}
          </p>
        </div>
          {(user.role === UserRoles.GURU || user.role === UserRoles.ADMIN) && (
            <div className="shrink-0">
              <CreateLiveSessionForm courses={courses} />
            </div>
          )}
        </div>
      </div>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-lg border shadow-sm">
          <div className="p-6">
            <LiveSessionList sessions={sessions} user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
