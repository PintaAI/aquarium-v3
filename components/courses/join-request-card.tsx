'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RequestStatusBadge } from './request-status-badge'
import { approveJoinRequest, rejectJoinRequest, revokeJoinRequest } from '@/app/actions/join-request-actions'
import { toast } from 'react-hot-toast'
import { User, Calendar, MessageSquare, X, Check, ImageIcon, UserX } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface JoinRequestCardProps {
  request: {
    id: number
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    message: string | null
    attachmentUrl: string | null
    contact: string | null
    reason: string | null
    createdAt: Date
    updatedAt: Date
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
    course?: {
      id: number
      title: string
      thumbnail: string | null
    }
  }
  onUpdate: () => void
  showCourseInfo?: boolean
}

export function JoinRequestCard({ request, onUpdate, showCourseInfo = false }: JoinRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [revokeReason, setRevokeReason] = useState('')

  const handleApprove = async () => {
    try {
      setIsProcessing(true)
      const result = await approveJoinRequest(request.id)
      
      if (result.success) {
        toast.success('Permintaan berhasil disetujui!')
        onUpdate()
      } else {
        toast.error(result.error || 'Gagal menyetujui permintaan')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Terjadi kesalahan saat menyetujui permintaan')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsProcessing(true)
      const result = await rejectJoinRequest(request.id, rejectReason.trim() || undefined)
      
      if (result.success) {
        toast.success('Permintaan berhasil ditolak')
        setIsRejectModalOpen(false)
        setRejectReason('')
        onUpdate()
      } else {
        toast.error(result.error || 'Gagal menolak permintaan')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Terjadi kesalahan saat menolak permintaan')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRevoke = async () => {
    try {
      setIsProcessing(true)
      const result = await revokeJoinRequest(request.id, revokeReason.trim() || undefined)
      
      if (result.success) {
        toast.success('Persetujuan berhasil dicabut dan user dihapus dari kursus')
        setIsRevokeModalOpen(false)
        setRevokeReason('')
        onUpdate()
      } else {
        toast.error(result.error || 'Gagal mencabut persetujuan')
      }
    } catch (error) {
      console.error('Error revoking request:', error)
      toast.error('Terjadi kesalahan saat mencabut persetujuan')
    } finally {
      setIsProcessing(false)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(request.createdAt), {
    addSuffix: true,
    locale: localeId
  })

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {request.user.image ? (
                <Image
                  src={request.user.image}
                  alt={request.user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User size={20} className="text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {request.user.name || 'User Tanpa Nama'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {request.user.email}
                </p>
                
                {showCourseInfo && request.course && (
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {request.course.title}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <RequestStatusBadge status={request.status} />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={12} />
                {timeAgo}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {request.message && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2">
                <MessageSquare size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">Pesan:</span>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {request.message}
              </p>
            </div>
          )}

          {request.contact && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2">
                <User size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">Kontak:</span>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {request.contact}
              </p>
            </div>
          )}

          {request.attachmentUrl && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2">
                <ImageIcon size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">Lampiran:</span>
              </div>
              <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                <Image
                  src={request.attachmentUrl}
                  alt="Attachment"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {request.status === 'REJECTED' && request.reason && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2">
                <X size={14} className="text-red-500" />
                <span className="text-sm font-medium text-red-700">Alasan Penolakan:</span>
              </div>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {request.reason}
              </p>
            </div>
          )}

          {request.status === 'PENDING' && (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check size={16} className="mr-1" />
                {isProcessing ? 'Memproses...' : 'Setujui'}
              </Button>
              <Button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isProcessing}
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <X size={16} className="mr-1" />
                Tolak
              </Button>
            </div>
          )}

          {request.status === 'APPROVED' && (
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-center text-sm text-green-600 bg-green-50 py-2 px-3 rounded-md border border-green-200">
                <Check size={14} className="mr-1" />
                Sudah disetujui
              </div>
              <Button
                onClick={() => setIsRevokeModalOpen(true)}
                disabled={isProcessing}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <UserX size={16} className="mr-1" />
                Cabut Persetujuan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Permintaan Bergabung</DialogTitle>
            <DialogDescription>
              Anda akan menolak permintaan dari {request.user.name || request.user.email}. 
              Anda dapat memberikan alasan penolakan (opsional).
            </DialogDescription>
          </DialogHeader>
          
          <div className="gap-4 py-4">
            <div className="gap-4">
              <Label htmlFor="reason">
                Alasan Penolakan (Opsional)
              </Label>
              <Textarea
                id="reason"
                placeholder="Berikan alasan mengapa permintaan ditolak..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
                rows={3}
                maxLength={300}
                disabled={isProcessing}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {rejectReason.length}/300 karakter
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing ? 'Memproses...' : 'Tolak Permintaan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Modal */}
      <Dialog open={isRevokeModalOpen} onOpenChange={setIsRevokeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cabut Persetujuan Bergabung</DialogTitle>
            <DialogDescription>
              Anda akan mencabut persetujuan untuk {request.user.name || request.user.email} dan menghapus mereka dari kursus. 
              Anda dapat memberikan alasan pencabutan (opsional).
            </DialogDescription>
          </DialogHeader>
          
          <div className="gap-4 py-4">
            <div className="gap-4">
              <Label htmlFor="revokeReason">
                Alasan Pencabutan (Opsional)
              </Label>
              <Textarea
                id="revokeReason"
                placeholder="Berikan alasan mengapa persetujuan dicabut..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="mt-2"
                rows={3}
                maxLength={300}
                disabled={isProcessing}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {revokeReason.length}/300 karakter
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRevokeModalOpen(false)}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleRevoke}
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing ? 'Memproses...' : 'Cabut Persetujuan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
