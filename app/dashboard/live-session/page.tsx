import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StartSessionButton } from '@/components/live-session/start-session-button'
import { getLiveSessions } from '@/app/actions/live-session-actions'
import { getCourses } from '@/app/actions/course-actions'
import { CreateSessionButton } from '@/components/live-session/create-session-form'
import { formatLocalDate } from '@/lib/date-utils'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video } from 'lucide-react'
import { DeleteSessionButton } from '@/components/live-session/delete-session-button'

export default async function LiveSessionPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const { active, scheduled } = await getLiveSessions()

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10" />
      
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="relative">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight">Live Sessions</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {session.user.role === "GURU" 
                    ? "Kelola sesi live streaming untuk berinteraksi dengan peserta didik secara langsung."
                    : "Bergabung dalam sesi pembelajaran langsung untuk belajar lebih interaktif."
                  }
                </p>
              </div>
              {session.user.role === 'GURU' && (
                <div className="sm:mt-1">
                  <CreateSessionButton courses={await getCourses()} />
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              {active.length === 0 && scheduled.length === 0 ? (
                <p className="text-muted-foreground">Tidak ada sesi live saat ini.</p>
              ) : (
                <div className="flex flex-col gap-4"> 
                  {[...active, ...scheduled].map((session) => (
                    <Card 
                      key={session.id} 
                      className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-primary/50 hover:-translate-y-1"
                    > 
                      <div className="relative h-32 w-full overflow-hidden">
                        {/* Gradient Background */}
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20">
                            {/* Decorative Elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
                            
                            {/* Host Info */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <Avatar className="h-8 w-8 border border-primary/20">
                                <AvatarImage src={session.creator.image || undefined} />
                                <AvatarFallback>{session.creator.name ? session.creator.name[0].toUpperCase() : '?'}</AvatarFallback>
                              </Avatar>
                              <div className="text-xs text-primary/60">
                                <p>{session.creator.name}</p>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                              <Badge 
                                variant={session.status === 'LIVE' ? "destructive" : "outline"}
                                className="whitespace-nowrap"
                              >
                                {session.status}
                              </Badge>
                            </div>
                            
                            {/* Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Video className="h-12 w-12 text-primary/40 group-hover:text-primary/60 transition-colors -translate-y-2" />
                            </div>

                            {/* Time Info */}
                            <div className="absolute bottom-2 left-3 right-3 flex justify-between text-xs text-primary/60">
                              <div>
                                {session.status === 'LIVE' ? (
                                  <>Started: {formatLocalDate(session.actualStart || session.scheduledStart, 'Pp')}</>
                                ) : (
                                  <>Starts: {formatLocalDate(session.scheduledStart, 'Pp')}</>
                                )}
                              </div>
                              {session.scheduledEnd && (
                                <div>
                                  Ends: {formatLocalDate(session.scheduledEnd, 'Pp')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 p-4">
                        {/* Left Side: Title, Course, Host, Description */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                              {session.name}
                            </CardTitle>
                          </div>
                          <CardDescription>
                            <div className="flex items-center gap-2">
                              <span className="line-clamp-1">{session.course.title}</span>
                              {session.streamCallId && (
                                <Badge variant="secondary" className="whitespace-nowrap">
                                  Stream Ready
                                </Badge>
                              )}
                            </div>
                          </CardDescription>
                          {session.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
                              {session.description}
                            </p>
                          )}
                        </div>

                        {/* Right Side: Status, Time, Buttons */}
                        <div className="flex flex-col items-start md:items-end gap-2 shrink-0 w-full md:w-auto">
                          <div className="flex flex-col gap-2 w-full mt-2">
                            {session.isCurrentUserCreator ? (
                              <>
                                {session.status === 'SCHEDULED' ? (
                                  <StartSessionButton sessionId={session.id} />
                                ) : (
                                  <Button className="w-full" variant="default" asChild>
                                    <Link href={`/dashboard/live-session/${session.id}`}>
                                      Join as Host
                                    </Link>
                                  </Button>
                                )}
                                <DeleteSessionButton sessionId={session.id} />
                              </>
                            ) : (
                              session.status === 'LIVE' ? (
                                <Button className="w-full" variant="default" asChild>
                                  <Link href={`/dashboard/live-session/${session.id}`}>
                                    Join Live Session
                                  </Link>
                                </Button>
                              ) : (
                                <Button className="w-full" variant="outline" disabled>
                                  Session Not Started
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
