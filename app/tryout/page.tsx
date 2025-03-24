import { getAllTryouts, getTryoutForUser } from "@/app/actions/tryout-actions"
import { TryoutList } from "@/components/tryout/TryoutList"
import { currentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function TryoutPage() {
  const user = await currentUser()
  if (!user) return null
  
  const tryouts = user.role === "GURU" 
    ? await getAllTryouts()
    : user.id
      ? await getTryoutForUser(user.id)
      : []

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex min-h-screen">
        <div className="container mx-auto py-4 px-4 md:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tryouts</h1>
              <p className="text-muted-foreground">
                {user.role === "GURU" 
                  ? "Manage your tryouts and view participant progress"
                  : "Join tryouts and test your knowledge"
                }
              </p>
            </div>
            {user.role === "GURU" && (
              <Link href="/tryout/create">
                <Button>Create Tryout</Button>
              </Link>
            )}
          </div>

        <TryoutList 
        tryouts={tryouts}
        userId={user.role === "MURID" ? user.id : undefined}
        showParticipantCount={user.role === "GURU"}
        isGuru={user.role === "GURU"}
        userRole={user.role}
      />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
