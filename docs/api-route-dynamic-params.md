# Handling Dynamic Route Parameters in Next.js API Routes (App Router)

This document explains the pattern for handling dynamic route parameters (e.g., `[userId]`) in Next.js API Route Handlers (typically `route.ts` files) within the App Router, particularly concerning changes observed with Next.js 15.

## Problem

A TypeScript build error can occur in API routes when accessing dynamic parameters. The error often indicates a type mismatch, where the route handler expects a plain object for `params` but Next.js provides it as a `Promise`.

For example, in `app/api/sertifikat/[userId]/route.ts`, the following signature might cause an error:

```typescript
// Old signature - may cause type errors
export async function GET(
  request: NextRequest,
  context: { params: { userId: string } } // Problematic part
) {
  // ...
  const { userId } = context.params; // Accessing params directly
  // ...
}
```

The error message would typically suggest that `{ params: { userId: string; } }` is not a valid type for the function's second argument because the expected type for `params` (or the context object containing it) is a `Promise`.

## Investigation

The change in behavior is that Next.js (observed around version 15) now provides the `params` object (or the context containing it) to API route handlers as a `Promise`. This means the parameters are resolved asynchronously.

## Solution

To correctly handle dynamic route parameters in API routes and resolve type errors, you need to:

1.  **Update Type Definition:** Adjust the type signature of your route handler (e.g., `GET`, `POST`) to reflect that the `params` (or the object containing them) are a `Promise`.
2.  **Await Resolution:** Use `await` to resolve the `Promise` before accessing the actual parameter values.

### Example: `app/api/sertifikat/[userId]/route.ts`

Here's how the `GET` handler in `app/api/sertifikat/[userId]/route.ts` was updated:

**Original (Problematic):**

```typescript
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } } // Type for params is a direct object
) {
  const { userId } = context.params; // Direct access
  // ...
}
```

**Corrected (Solution):**

```typescript
import { NextRequest, NextResponse } from 'next/server'; // NextResponse might be needed for the return

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // params is now a Promise
) {
  const { userId } = await params; // Await the resolution of params
  
  // Lanjutkan dengan logika Anda menggunakan userId
  // Example: return NextResponse.json({ userId });
  // ...
}
```

**Key Changes:**

*   The second argument to `GET` is destructured to get `params`.
*   The type for `params` is now `Promise<{ userId: string }>`.
*   `await params` is used to get the resolved object containing `userId`.

By adopting this pattern, type mismatches related to dynamic route parameters in API routes are resolved, ensuring compatibility with how Next.js handles these parameters asynchronously. This approach maintains consistency and allows TypeScript builds to complete successfully.
