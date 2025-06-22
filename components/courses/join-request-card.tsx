'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { RequestStatusBadge } from './request-status-badge'
import { approveJoinRequest, rejectJoinRequest, revokeJoinRequest } from '@/app/actions/join-request-actions'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Calendar, 
  MessageSquare, 
  X, 
  Check, 
  ImageIcon, 
  UserX, 
  ZoomIn, 
  ChevronDown,
  Phone,
  FileText
} from 'lucide-react'
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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
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

  const hasDetails = request.message || request.contact || request.attachmentUrl || (request.status === 'REJECTED' && request.reason)

  return (
    <>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          {/* Main row - compact list format */}
          <div className="flex items-center justify-between gap-3">
            {/* User info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {request.user.image ? (
                <Image
                  src={request.user.image}
                  alt={request.user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">
                    {request.user.name || 'User Tanpa Nama'}
                  </h4>
                  <RequestStatusBadge status={request.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{request.user.email}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    {timeAgo}
                  </div>
                </div>
                
                {showCourseInfo && request.course && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {request.course.title}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Details toggle if there are details */}
              {hasDetails && (
                <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} 
                      />
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              )}

              {/* Status-specific actions */}
              {request.status === 'PENDING' && (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    size="sm"
                    className="h-8 bg-green-600 hover:bg-green-700 text-white px-3"
                  >
                    <Check size={14} className="mr-1" />
                    Setujui
                  </Button>
                  <Button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                    className="h-8 text-red-600 border-red-200 hover:bg-red-50 px-3"
                  >
                    <X size={14} className="mr-1" />
                    Tolak
                  </Button>
                </>
              )}

              {request.status === 'APPROVED' && (
                <Button
                  onClick={() => setIsRevokeModalOpen(true)}
                  disabled={isProcessing}
                  variant="outline"
                  size="sm"
                  className="h-8 text-red-600 border-red-200 hover:bg-red-50 px-3"
                >
                  <UserX size={14} className="mr-1" />
                  Cabut
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible details */}
          {hasDetails && (
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <CollapsibleContent className="mt-4 pt-4 border-t border-border">
                <div className="grid gap-4">
                  {request.message && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Pesan:</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        {request.message}
                      </p>
                    </div>
                  )}

                  {request.contact && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Kontak:</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        {request.contact}
                      </p>
                    </div>
                  )}

                  {request.attachmentUrl && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Lampiran:</span>
                      </div>
                      <div 
                        className="relative w-32 h-24 bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group"
                        onClick={() => setIsImageModalOpen(true)}
                      >
                        <Image
                          src={request.attachmentUrl}
                          alt="Attachment"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === 'REJECTED' && request.reason && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-red-500" />
                        <span className="text-sm font-medium text-red-700">Alasan Penolakan:</span>
                      </div>
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        {request.reason}
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
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

      {/* Image Zoom Modal */}
      {request.attachmentUrl && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-2">
            <DialogHeader className="px-4 py-2">
              <DialogTitle className="text-lg">Lampiran Detail</DialogTitle>
              <DialogDescription>
                Klik di luar gambar atau tekan Escape untuk menutup
              </DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-[70vh] overflow-hidden rounded-md">
              <Image
                src={request.attachmentUrl}
                alt="Attachment Detail"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
