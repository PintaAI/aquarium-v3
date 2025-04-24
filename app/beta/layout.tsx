import { Sparkles } from "lucide-react"

export default function BetaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
          <Sparkles className="h-3.5 w-3.5" />
          Beta
        </div>
      </div>
      {children}
    </>
  )
}
