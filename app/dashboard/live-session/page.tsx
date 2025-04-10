import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StartSessionButton } from '@/components/live-session/start-session-button'
import { getLiveSessions } from '@/app/actions/live-session-actions'
import { getCourses } from '@/app/actions/course-actions'
import { CreateSessionButton } from '@/components/live-session/create-session-form'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...active, ...scheduled].map((session) => (
              <Card key={session.id}>
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="line-clamp-1">{session.name}</CardTitle>
                    <Badge 
                      variant={session.status === 'LIVE' ? "destructive" : "outline"}
                      className="whitespace-nowrap"
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={session.creator.image || undefined} />
                        <AvatarFallback>
                          {session.creator.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{session.creator.name}</p>
                        <p className="text-muted-foreground">Host</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      {session.isCurrentUserCreator ? (
                        // GURU: Show Start/Join/Delete buttons
                        <div className="flex flex-col gap-2"> {/* Wrap buttons */}
                          {session.status === 'SCHEDULED' ? (
                            <StartSessionButton sessionId={session.id} />
                          ) : (
                            <Button 
                              className="w-full" 
                              variant="default" 
                            asChild
                          >
                            <Link href={`/dashboard/live-session/${session.id}`}>
                              Join Session
                            </Link>
                          </Button>
                          )}
                          {/* Add Delete Button Here - Only for creator */}
                          <DeleteSessionButton sessionId={session.id} />
                        </div>
                      ) : (
                        // MURID: Show Join button or waiting state
                        session.status === 'LIVE' ? (
                          <Button 
                            className="w-full" 
                            variant="default" 
                            asChild
                          >
                            <Link href={`/dashboard/live-session/${session.id}`}>
                              Join Session
                            </Link>
                          </Button>
                        ) : (
                          <Button className="w-full" variant="outline" disabled>
                            Session Not Started
                          </Button>
                        )
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {session.status === 'LIVE' ? (
                            <>
                              Started: {format(new Date(session.actualStart || session.scheduledStart), 'PPp')}
                            </>
                          ) : (
                            <>
                              Starts: {format(new Date(session.scheduledStart), 'PPp')}
                            </>
                          )}
                        </span>
                      </div>
                      {session.scheduledEnd && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Ends: {format(new Date(session.scheduledEnd), 'PPp')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
