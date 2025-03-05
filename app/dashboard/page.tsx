import { getRequiredSession } from "@/lib/session"
import { ThemeToggle } from "@/components/theme-toggle"

import { AuthButton } from "@/components/auth/auth-button"
import { PushNotificationHandler } from "@/components/push-notification-handler"
import { SendNotificationForm } from "@/components/send-notification-form"
import { ProfileSection } from "@/components/experiment/profile-section"


export default async function DashboardPage() {
  // This will automatically redirect to login if not authenticated
  const session = await getRequiredSession()

  return (
    <div className="min-h-screen p-8">
      <header className="flex items-center mx-auto max-w-4xl justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AuthButton/>
        </div>
      </header>

      <main>
        <div className="flex flex-col gap-6 mx-auto max-w-4xl">
          {/* Server-side rendered profile */}
          <section className="rounded-lg border p-4">
            <h2 className="font-semibold mb-2">Your Profile (Server)</h2>
            <div className="text-sm text-muted-foreground">
              <p>Role: {session.user.role}</p>
              <p>ID: {session.user.id}</p>
            </div>
          </section>

          {/* Client-side rendered profile with live updates */}
          <ProfileSection />

          {/* Push Notification Handler */}
          <PushNotificationHandler />

          {/* Admin Only: Send Notifications */}
          {session.user.role === 'ADMIN' && (
            <SendNotificationForm />
          )}
        </div>
      </main>
    </div>
  )
}
