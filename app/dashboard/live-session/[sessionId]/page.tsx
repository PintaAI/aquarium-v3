import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getLiveSession } from '@/app/actions/live-session-actions'
import { VideoComponent } from '@/components/live-session/video-component'
import { SessionInfo } from '@/components/live-session/session-info'
import { ChatComponent } from '@/components/live-session/chat-component'

interface PageProps {
  params: {
    sessionId: string
  }
}

export default async function LiveSessionPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const liveSession = await getLiveSession(params.sessionId)
  if (!liveSession) {
    redirect('/dashboard/live-session')
  }

  const isCreator = liveSession.creator.id === session.user.id

  return (
    <div className="container mx-auto space-y-6 md:space-y-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-2">
          <VideoComponent 
            streamCallId={liveSession.streamCallId}
            isCreator={isCreator}
          />
          <SessionInfo 
            name={liveSession.name}
            description={liveSession.description}
            courseTitle={liveSession.course.title}
            status={liveSession.status}
            instructor={{
              name: liveSession.creator.name || 'Unnamed Instructor',
              image: liveSession.creator.image || undefined
            }}
            startTime={liveSession.scheduledStart}
            viewCount={liveSession.participants.length}
          />
        </div>
        <div className="md:h-screen md:sticky md:top-0">
          <div className="h-[294px] md:h-[570px] px-3 mt-1">
            <ChatComponent 
              sessionId={liveSession.id}
              username={session.user.name || 'Anonymous'}
            />
          </div>
        </div>
      </div>
    </div>
   
  )
}
