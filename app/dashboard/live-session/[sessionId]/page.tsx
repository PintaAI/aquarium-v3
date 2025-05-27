import { auth } from '@/auth'
import { redirect } from 'next/navigation'
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

  // We know users exists because we checked guruUsersResult.success above
  return (
    <LiveSessionWrapper
      liveSessionData={liveSession}
      isCreator={isCreator}
      guruUsers={guruUsersResult.users!}
    />
  )
}
