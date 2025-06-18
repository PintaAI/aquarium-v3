'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { requestJoinCourse } from '@/app/actions/join-request-actions'
import { uploadImage } from '@/app/actions/upload-image'
import { toast } from 'react-hot-toast'
import { Upload, X,} from 'lucide-react'
import Image from 'next/image'

interface RequestJoinModalProps {
  courseId: number
  courseTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  price?: number | null
  paidMessage?: string | null
}

export function RequestJoinModal({
  courseId,
  courseTitle,
  isOpen,
  onClose,
  onSuccess,
  price,
  paidMessage
}: RequestJoinModalProps) {
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      
      const imageUrl = await uploadImage(formData)
      setAttachmentUrl(imageUrl)
      toast.success('Gambar berhasil diunggah!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Gagal mengunggah gambar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAttachment = () => {
    setAttachmentUrl('')
  }

  const handleSubmit = async () => {
    // Validate required fields for paid courses
    if (price && price > 0 && !attachmentUrl) {
      toast.error('Bukti pembayaran wajib untuk kelas berbayar')
      return
    }

    try {
      setIsSubmitting(true)
      
      const result = await requestJoinCourse({
        courseId,
        message: message.trim() || undefined,
        contact: contact.trim() || undefined,
        attachmentUrl: attachmentUrl || undefined
      })

      if (result.success) {
        toast.success('Permintaan bergabung berhasil dikirim!')
        setMessage('')
        setContact('')
        setAttachmentUrl('')
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || 'Gagal mengirim permintaan')
      }
    } catch (error) {
      console.error('Error submitting join request:', error)
      toast.error('Terjadi kesalahan saat mengirim permintaan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting && !isUploading) {
      setMessage('')
      setContact('')
      setAttachmentUrl('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Minta Bergabung dengan Kursus</DialogTitle>
          <DialogDescription asChild>
            {paidMessage ? (
              <div className="space-y-2">
                <div>{paidMessage}</div>
                {price && (
                  <div className="font-semibold text-primary">
                    Biaya: Rp {price.toLocaleString('id-ID')}
                  </div>
                )}
              </div>
            ) : (
              <div>Kirim permintaan untuk bergabung dengan &quot;{courseTitle}&quot;. Penulis kursus akan meninjau permintaan Anda.</div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="gap-6 py-4 space-y-4">
          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Pesan (Opsional)
            </Label>
            <Textarea
              id="message"
              placeholder="Jelaskan mengapa Anda ingin bergabung dengan kursus ini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isSubmitting || isUploading}
            />
            <div className="text-xs text-muted-foreground">
              {message.length}/500 karakter
            </div>
          </div>

          {/* Contact Field */}
          <div className="space-y-2">
            <Label htmlFor="contact">
              Kontak (Opsional)
            </Label>
            <Input
              id="contact"
              placeholder="Nomor HP, email, atau kontak lainnya..."
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={100}
              disabled={isSubmitting || isUploading}
            />
            <div className="text-xs text-muted-foreground">
              Informasi kontak tambahan untuk komunikasi
            </div>
          </div>

          {/* Attachment Field */}
          <div className="space-y-2">
            <Label htmlFor="attachment">
              Bukti Pembayaran {price && price > 0 ? '(Wajib)' : '(Opsional)'}
            </Label>
            
            {!attachmentUrl ? (
              <div>
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload size={24} />
                      <span className="text-sm">
                        {isUploading ? 'Mengunggah...' : 'Klik untuk mengunggah gambar'}
                      </span>
                    </div>
                  </div>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isSubmitting || isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="relative">
                <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={attachmentUrl}
                    alt="Attachment"
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={handleRemoveAttachment}
                    disabled={isSubmitting}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {price && price > 0 
                ? 'Bukti pembayaran wajib untuk kelas berbayar ini'
                : 'Unggah bukti pembayaran atau dokumen pendukung lainnya'
              }
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
