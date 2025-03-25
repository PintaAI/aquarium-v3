import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/auth"
import { getTryout, joinTryout } from "@/app/actions/tryout-actions"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { TryoutQuiz } from "@/components/tryout/TryoutQuiz"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface Props {
  params: Promise<{
    id: string
  }>
}

async function getQuestions(koleksiSoalId: number) {
  return db.soal.findMany({
    where: { koleksiId: koleksiSoalId },
    include: {
      opsis: {
        select: {
          id: true,
          opsiText: true
        }
      }
    }
  })
}

export default async function TryoutPage(props: Props) {
  const params = await props.params;
  const user = await currentUser()
  if (!user) return null
  
  const tryoutId = parseInt(params.id)
  
  // Redirect guru/admin to leaderboard immediately
  if (user?.role === "GURU" || user?.role === "ADMIN") {
    redirect(`/tryout/${tryoutId}/leaderboard`)
  }

  const tryout = await getTryout(tryoutId)
  if (!tryout) notFound()

  const userParticipation = tryout.participants.find(p => p.userId === user.id)
  const now = new Date()
  const status = now > tryout.endTime 
    ? 'ended' 
    : now >= tryout.startTime 
    ? 'active' 
    : 'upcoming'

  async function join() {
    "use server"
    if (!user) return
    await joinTryout(tryoutId, user.id)
  }

  // Fetch questions only if needed (user has joined and tryout is active)
  const questions = (status === 'active' && userParticipation && !userParticipation.submittedAt) 
    ? await getQuestions(tryout.koleksiSoalId)
    : null

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{tryout.koleksiSoal.nama}</h1>
          {status === 'ended' && (
            <Link href={`/tryout/${tryoutId}/leaderboard`}>
              <Button>View Leaderboard</Button>
            </Link>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Start Time</p>
            <p className="font-medium">{formatDate(tryout.startTime)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Time</p>
            <p className="font-medium">{formatDate(tryout.endTime)}</p>
          </div>
        </div>

          <div>
            {(() => {
              if (status === 'upcoming') {
                return (
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <p>This tryout will start at {formatDate(tryout.startTime)}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Come back when the tryout starts to participate
                    </p>
                  </div>
                )
              }

              if (status === 'ended') {
                if (!userParticipation) {
                  return (
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <p>This tryout has ended</p>
                    </div>
                  )
                }
                
                return (
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Your Score</h2>
                    <p className="text-3xl font-bold text-primary">
                      {userParticipation.score}
                    </p>
                    <Link href={`/tryout/${tryoutId}/leaderboard`} className="mt-4 block">
                      <Button>View Leaderboard</Button>
                    </Link>
                  </div>
                )
              }

              if (!userParticipation) {
                return (
                  <form action={join}>
                    <Button className="w-full">Join Tryout</Button>
                  </form>
                )
              }

              if (!userParticipation.submittedAt && questions) {
                return (
                  <TryoutQuiz
                    tryoutId={tryoutId}
                    userId={user.id}
                    questions={questions}
                  />
                )
              }

              return (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p>Your answers have been submitted</p>
                  <Link href={`/tryout/${tryoutId}/leaderboard`} className="mt-4 block">
                    <Button>View Leaderboard</Button>
                  </Link>
                </div>
              )
            })()}
          </div>
      </div>
    </div>
  )
}
