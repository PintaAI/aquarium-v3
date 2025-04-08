import { Toaster } from 'sonner'

export default function LiveSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Toaster />
      {children}
    </>
  )
}
