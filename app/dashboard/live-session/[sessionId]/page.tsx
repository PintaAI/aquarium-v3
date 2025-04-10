import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getLiveSession } from '@/app/actions/live-session-actions'
// Import the new wrapper component
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

  const liveSession = await getLiveSession(sessionId) // Use the resolved sessionId
  if (!liveSession) {
    // Redirect if session data couldn't be fetched (e.g., invalid ID)
    redirect('/dashboard/live-session?error=session_not_found')
  }

  // Determine if the current user is the creator
  const isCreator = liveSession.creator.id === session.user.id

  // Render the client wrapper component, passing down the fetched data
  return (
    <LiveSessionWrapper
      liveSessionData={liveSession}
      isCreator={isCreator}
    />
  )
}
