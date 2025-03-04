import { auth } from "@/auth"
import { redirect } from "next/navigation"

/**
 * Get the current user session. Redirects to login if not authenticated.
 * @param redirectTo Optional URL to redirect to after successful authentication
 * @returns Session object
 */
export async function getRequiredSession(redirectTo?: string) {
  const session = await auth()

  if (!session?.user) {
    redirect(redirectTo ?? '/auth/login')
  }

  return session
}

/**
 * Get the current user session without redirection.
 * @returns Session object or null if not authenticated
 */
export async function getSession() {
  return await auth()
}
