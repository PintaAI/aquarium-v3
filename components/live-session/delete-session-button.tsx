'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteLiveSession } from '@/app/actions/live-session-actions'
import { toast } from 'sonner' // Use sonner for notifications
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteSessionButtonProps {
  sessionId: string
}

export function DeleteSessionButton({ sessionId }: DeleteSessionButtonProps) {
  // Removed useToast hook
  const [isPending, startTransition] = useTransition()
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLiveSession(sessionId)
      if (result.success) {
        toast.success('Berhasil', { // Use sonner toast.success
          description: 'Sesi live berhasil dihapus.',
        })
        setIsAlertOpen(false) 
      } else {
        toast.error('Gagal', { // Use sonner toast.error
          description: result.error || 'Gagal menghapus sesi live.',
        })
      }
    })
  }

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        {/* Added disabled={isPending} to the trigger button */}
        <Button variant="destructive" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Hapus Sesi
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus sesi live secara permanen
            beserta data terkait. Jika sesi sedang berlangsung, mungkin tidak akan berhenti secara otomatis.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Lanjutkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
