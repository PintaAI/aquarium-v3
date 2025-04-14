import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StartSessionButton } from '@/components/live-session/start-session-button'
import { getLiveSessions } from '@/app/actions/live-session-actions'
import { getCourses } from '@/app/actions/course-actions'
import { CreateSessionButton } from '@/components/live-session/create-session-form'
import { format } from 'date-fns'
import { Card,  CardDescription,  CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteSessionButton } from '@/components/live-session/delete-session-button'



export default async function LiveSessionPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const { active, scheduled } = await getLiveSessions()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Live Sessions</h1>
        {session.user.role === 'GURU' && (
          <CreateSessionButton courses={await getCourses()} />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Sessions</h2>
        {active.length === 0 && scheduled.length === 0 ? (
          <p className="text-muted-foreground">No sessions available.</p>
        ) : (
          // Change from grid to flex column
          <div className="flex flex-col gap-4"> 
            {[...active, ...scheduled].map((session) => (
              // Make card content flex row
              <Card key={session.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4"> 
                {/* Left Side: Title, Course, Host, Description */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="line-clamp-1">{session.name}</CardTitle>
                    <Badge 
                      variant={session.status === 'LIVE' ? "destructive" : "outline"}
                      className="whitespace-nowrap ml-2 md:hidden" // Show badge on mobile
                    >
                      {session.status}
                    </Badge>
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
                   <div className="flex items-center gap-2 pt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.creator.image || undefined} />
                        <AvatarFallback>
                          {session.creator.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{session.creator.name}</p>
                        <p className="text-muted-foreground text-xs">Host</p>
                      </div>
                    </div>
                </div>

                {/* Right Side: Status, Time, Buttons */}
                <div className="flex flex-col items-start md:items-end gap-2 shrink-0 w-full md:w-auto">
                   <Badge 
                      variant={session.status === 'LIVE' ? "destructive" : "outline"}
                      className="whitespace-nowrap hidden md:inline-flex" // Show badge on desktop
                    >
                      {session.status}
                    </Badge>
                   <div className="text-xs text-muted-foreground text-right w-full">
                      <div>
                        {session.status === 'LIVE' ? (
                          <>
                            Started: {format(new Date(session.actualStart || session.scheduledStart), 'PPp')}
                          </>
                        ) : (
                          <>
                            Starts: {format(new Date(session.scheduledStart), 'PPp')}
                          </>
                        )}
                      </div>
                      {session.scheduledEnd && (
                        <div>
                          Ends: {format(new Date(session.scheduledEnd), 'PPp')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-2">
                      {session.isCurrentUserCreator ? (
                        // GURU: Show Start/Join/Delete buttons
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
                        // MURID: Show Join button or waiting state
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
