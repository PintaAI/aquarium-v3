import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LiveSessionList } from "@/components/live-session/live-session-list"
import { CreateLiveSessionForm } from "@/components/live-session/create-live-session-form"
import { getAllLiveSessions, getCoursesForLiveSession } from "@/app/actions/live-session-actions"
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

  // Get sessions using server action
  const sessions = await getAllLiveSessions()

  // Get courses for create form using server action
  const courses = await getCoursesForLiveSession()

  return (
    <div className="min-h-screen py-4 sm:py-8 space-y-4 sm:space-y-8">
      <div className="container max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-background rounded-lg border p-4 sm:p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live Sessions</h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[42ch] sm:max-w-md">
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
      <div className="container max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-background rounded-lg border shadow-sm">
          <div className="p-4 sm:p-6">
            <LiveSessionList sessions={sessions} user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
