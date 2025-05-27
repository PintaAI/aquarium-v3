import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/auth"
import { getTryout, joinTryout } from "@/app/actions/tryout-actions"
import { PiSealWarningFill } from "react-icons/pi"
import { HiArrowRight } from "react-icons/hi2"
import { MdArrowRightAlt } from "react-icons/md"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { TryoutQuiz } from "@/components/tryout/TryoutQuiz"
import { formatLocalDate } from "@/lib/date-utils"
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
  
  const tryout = await getTryout(tryoutId)
  if (!tryout) notFound()

  const now = new Date()
  // Redirect to leaderboard if tryout has ended or user is guru/admin
  if (now > tryout.endTime || user?.role === "GURU" || user?.role === "ADMIN") {
    redirect(`/tryout/${tryoutId}/leaderboard`)
  }

  const userParticipation = tryout.participants.find(p => p.userId === user.id)
  const status = now >= tryout.startTime ? 'active' : 'upcoming'

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
      <div className="mb-6 m-2">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-2xl font-bold">{tryout.koleksiSoal.nama}</h1>
        </div>

        <div className="flex justify-center text-muted-foreground items-center gap-4 mb-6 text-center text-sm">
          <div className="flex items-center gap-2">
            
            <span className="font-medium">{formatLocalDate(tryout.startTime, 'MMM d, p')}</span>
          
          </div>
          <div className="flex items-center">
            <MdArrowRightAlt className="w-6 h-6 text-muted-foregroundn mt-0.5" />
          </div>
          <div className="flex items-center gap-2">
           
            <span className="font-medium">{formatLocalDate(tryout.endTime, 'MMM d, p')}</span>
          </div>
        </div>

          <div>
            {(() => {
              if (status === 'upcoming') {
                return (
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <p>This tryout will start at {formatLocalDate(tryout.startTime, 'MMM d, p')}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Come back when the tryout starts to participate
                    </p>
                  </div>
                )
              }

              if (!userParticipation) {
                return (
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-yellow-100/10 rounded-lg border border-yellow-200/20">
                      <div className="flex flex-col items-center mb-4">
                        <PiSealWarningFill className="w-10 h-10 text-yellow-500 mb-2" />
                        <span className="font-bold text-yellow-500">PERHATIAN!!!</span>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        Silahkan melakukan latihan soal terlebih dahulu jika belum yakin
                      </p>
                      <Link href="/soal" className="text-primary hover:underline inline-flex items-center justify-center gap-2">
                        Klik di sini untuk latihan
                        <HiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <form action={join}>
                      <Button className="w-full text-lg" size="lg">Mulai Tryout</Button>
                    </form>
                  </div>
                )
              }

              if (!userParticipation.submittedAt && questions) {
                return (
                  <TryoutQuiz
                    tryoutId={tryoutId}
                    userId={user.id}
                    questions={questions}
                    duration={tryout.duration}
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
