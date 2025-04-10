import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getLiveSession } from '@/app/actions/live-session-actions'
// Import the new wrapper component
import { LiveSessionWrapper } from '@/components/live-session/live-session-wrapper'
// ChatComponent is now rendered inside the wrapper, so we don't need it here directly

interface PageProps {
  params: { // Corrected params type based on previous file content
    sessionId: string
  }
}

// This remains a Server Component for initial data fetching
export default async function LiveSessionPage({ params }: PageProps) {
  // Removed the await for params as it's directly available in App Router
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const liveSession = await getLiveSession(params.sessionId)
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
