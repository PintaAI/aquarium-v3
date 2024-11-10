import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication pages for Aquarium",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
     
      <main>
        {children}
      </main>
    </div>
  )
}