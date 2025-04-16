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
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-pruimary/10 -z-10" />
      
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="relative">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tryout</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {user.role === "GURU" 
                    ? "Kelola ujian latihan untuk memantau perkembangan peserta didik Anda."
                    : "Uji kemampuan bahasa Korea Anda dengan ujian latihan yang tersedia."
                  }
                </p>
              </div>
              {user.role === "GURU" && (
                <div className="sm:mt-1">
                  <CreateTryoutDialog koleksiSoals={koleksiSoals} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        
          <div className="p-0">
            <TryoutList 
              tryouts={tryouts}
              userId={user.role === "MURID" ? user.id : undefined}
              showParticipantCount={user.role === "GURU"}
              isGuru={user.role === "GURU"}
              userRole={user.role}
            />
          </div>
        
    </div>
      </div>
  )
}
