# Handling Dynamic Route Parameter Typing

This document explains a specific pattern used in this project for handling props, particularly the `params` object, in Next.js dynamic route pages (App Router).

## Problem

A TypeScript build error was encountered related to the `app/dashboard/live-session/[sessionId]/page.tsx` component. The error message indicated a type mismatch for the `params` prop:

```
Type error: Type '{ params: { sessionId: string; }; }' does not satisfy the constraint 'PageProps'.
  Types of property 'params' are incompatible.
    Type '{ sessionId: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally, [Symbol.toStringTag]
```

This meant the build process expected the `params` prop to be a `Promise`, but the component's type definition treated it as a plain object (`{ sessionId: string }`).

## Investigation

To determine the correct approach within this project, the `app/courses/[id]/page.tsx` file was examined as a reference for another dynamic route.

## Discovered Convention

The reference file (`app/courses/[id]/page.tsx`) revealed a consistent pattern for handling dynamic route parameters:

1.  **Props Interface:** An interface is defined specifically for the page component's props.
    ```typescript
    interface CourseIdPageProps {
      params: Promise<{
        id: string;
      }>;
    }
    ```
2.  **Promise Typing:** The `params` property within this interface is explicitly typed as a `Promise` that resolves to the object containing the route parameters.
3.  **Await Resolution:** Inside the asynchronous page component, `props.params` is awaited to resolve the promise before accessing the actual parameter values.
    ```typescript
    export default async function CourseIdPage(props: CourseIdPageProps) {
      const params = await props.params; // Await the promise
      const courseId = parseInt(params.id); // Access the resolved value
      // ... rest of the component
    }
    ```

## Solution

The `app/dashboard/live-session/[sessionId]/page.tsx` file was updated to align with this established project convention:

1.  A `LiveSessionPageProps` interface was created:
    ```typescript
    interface LiveSessionPageProps {
      params: Promise<{
        sessionId: string;
      }>;
    }
    ```
2.  The component function signature was updated:
    ```typescript
    export default async function LiveSessionPage(props: LiveSessionPageProps) {
      // ...
    }
    ```
3.  `params` was awaited before use:
    ```typescript
    const params = await props.params;
    const { sessionId } = params;
    // ... use sessionId
    ```

By adopting this pattern, the type mismatch was resolved, satisfying the TypeScript compiler and allowing the build to complete successfully. This ensures consistency in how dynamic route parameters are handled across the application.
