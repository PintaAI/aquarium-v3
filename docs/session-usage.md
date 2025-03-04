# Getting User Session in Next.js

This guide shows different ways to access the user session in your Next.js application.

## Server Components (Recommended)

The simplest way to get the session on the server is using the `auth()` function:

```tsx
import { auth } from "@/auth"

export default async function ServerComponent() {
  const session = await auth()
  
  if (!session) return <div>Not logged in</div>
  
  return <div>Welcome {session.user.email}</div>
}
```

## Client Components

For client-side components, you need to:

1. Wrap your app with `SessionProvider`
2. Use the `useSession` hook

First in your root layout:

```tsx
// app/layout.tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
```

Then in your client component:

```tsx
"use client"
import { useSession } from "next-auth/react"

export default function ClientComponent() {
  const { data: session } = useSession()
  
  if (!session) return <div>Not logged in</div>
  
  return <div>Welcome {session.user.email}</div>
}
```

## Best Practices

1. Prefer server components when possible for better performance and security
2. Only use client-side session access when you need interactivity
3. Remember that session data includes sensitive info - avoid exposing it unnecessarily
4. Type your session data properly for better TypeScript support
