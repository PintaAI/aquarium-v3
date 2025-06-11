import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLiveSession } from '@/app/actions/live-session-actions'
import { getAllGuruUsers } from '@/app/actions/user-actions'
import { LiveSessionWrapper } from '@/components/live-session/live-session-wrapper'
// ChatComponent is now rendered inside the wrapper, so we don't need it here directly

// Define props using an interface consistent with other dynamic pages
interface LiveSessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

// This remains a Server Component for initial data fetching
export default async function LiveSessionPage(props: LiveSessionPageProps) {
  // Await params as per project convention seen in other dynamic routes
  const params = await props.params;
  const { sessionId } = params;

  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const [liveSession, guruUsersResult] = await Promise.all([
    getLiveSession(sessionId),
    getAllGuruUsers()
  ]);

  if (!liveSession) {
    redirect('/dashboard/live-session?error=session_not_found')
  }

  if (!guruUsersResult.success) {
    console.error("Failed to fetch GURU users");
    redirect('/dashboard/live-session?error=failed_to_fetch_users')
  }

  const isCreator = liveSession.creator.id === session.user.id
  const isMember = liveSession.isCurrentUserMember
  
  // Check if user has access to this session
  if (!isCreator && !isMember && session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
          <p className="text-muted-foreground mb-4">
            Kamu bukan member dari {liveSession.course.title}, silahkan join terlebih dahulu
          </p>
          <Link
            href={`/courses/${liveSession.courseId}`}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Lihat Kursus
          </Link>
        </div>
      </div>
    )
  }

  // We know users exists because we checked guruUsersResult.success above
  return (
    <LiveSessionWrapper
      liveSessionData={liveSession}
      isCreator={isCreator}
      guruUsers={guruUsersResult.users!}
    />
  )
}
