import { getAllTryouts, getTryoutForUser } from "@/app/actions/tryout-actions"
import { TryoutList } from "@/components/tryout/TryoutList"
import { currentUser } from "@/lib/auth"
import { CreateTryoutDialog } from "@/components/tryout/create-tryout-dialog"
import { db } from "@/lib/db"

export default async function TryoutPage() {
  const user = await currentUser()
  if (!user) return null
  
  const [tryouts, koleksiSoals] = await Promise.all([
    user.role === "GURU" 
      ? getAllTryouts()
      : user.id
        ? await getTryoutForUser(user.id)
        : [],
    user.role === "GURU"
      ? db.koleksiSoal.findMany({
          where: {
            soals: {
              some: {
                authorId: user.id
              }
            }
          }
        })
      : []
  ])

  return (
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
              <CreateTryoutDialog koleksiSoals={koleksiSoals} />
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
  )
}
