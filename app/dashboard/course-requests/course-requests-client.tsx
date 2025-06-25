'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { Search, Filter, Check, X, UserX, ChevronDown, MessageSquare, Phone, User, Eye } from 'lucide-react'
import { getAllJoinRequests, approveJoinRequest, rejectJoinRequest, revokeJoinRequest, deleteJoinRequest } from '@/app/actions/join-request-actions'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import Image from 'next/image'

interface CourseRequest {
  id: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  message: string | null
  attachmentUrl: string | null
  contact: string | null
  reason: string | null
  createdAt: Date
  updatedAt: Date
  course: {
    id: number
    title: string
    thumbnail: string | null
  }
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface CourseRequestsClientProps {
  initialRequests: CourseRequest[]
}

export function CourseRequestsClient({ initialRequests }: CourseRequestsClientProps) {
  const [requests, setRequests] = useState<CourseRequest[]>(initialRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [courseFilter, setCourseFilter] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [processingId, setProcessingId] = useState<number | null>(null)
  
  // Modals
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<CourseRequest | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [revokeReason, setRevokeReason] = useState('')

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = 
        request.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      const matchesCourse = courseFilter === null || request.course.id === courseFilter
      
      return matchesSearch && matchesStatus && matchesCourse
    })
  }, [requests, searchTerm, statusFilter, courseFilter])

  // Get unique courses for filtering
  const uniqueCourses = useMemo(() => {
    const coursesMap = new Map()
    requests.forEach(request => {
      if (!coursesMap.has(request.course.id)) {
        coursesMap.set(request.course.id, {
          id: request.course.id,
          title: request.course.title,
          count: 0
        })
      }
      coursesMap.get(request.course.id).count++
    })
    return Array.from(coursesMap.values()).sort((a, b) => b.count - a.count)
  }, [requests])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const result = await getAllJoinRequests()
      if (result.success && result.requests) {
        setRequests(result.requests)
      }
    } catch (error) {
      console.error('Error refreshing requests:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleRowExpansion = (requestId: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(requestId)) {
      newExpandedRows.delete(requestId)
    } else {
      newExpandedRows.add(requestId)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleApprove = async (request: CourseRequest) => {
    try {
      setProcessingId(request.id)
      const result = await approveJoinRequest(request.id)
      
      if (result.success) {
        toast.success('Permintaan berhasil disetujui!')
        handleRefresh()
      } else {
        toast.error(result.error || 'Gagal menyetujui permintaan')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Terjadi kesalahan saat menyetujui permintaan')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    
    try {
      setProcessingId(selectedRequest.id)
      const result = await rejectJoinRequest(selectedRequest.id, rejectReason.trim() || undefined)
      
      if (result.success) {
        toast.success('Permintaan berhasil ditolak')
        setIsRejectModalOpen(false)
        setRejectReason('')
        setSelectedRequest(null)
        handleRefresh()
      } else {
        toast.error(result.error || 'Gagal menolak permintaan')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Terjadi kesalahan saat menolak permintaan')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRevoke = async () => {
    if (!selectedRequest) return
    
    try {
      setProcessingId(selectedRequest.id)
      const result = await revokeJoinRequest(selectedRequest.id, revokeReason.trim() || undefined)
      
      if (result.success) {
        toast.success('Persetujuan berhasil dicabut dan user dihapus dari kursus')
        setIsRevokeModalOpen(false)
        setRevokeReason('')
        setSelectedRequest(null)
        handleRefresh()
      } else {
        toast.error(result.error || 'Gagal mencabut persetujuan')
      }
    } catch (error) {
      console.error('Error revoking request:', error)
      toast.error('Terjadi kesalahan saat mencabut persetujuan')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (request: CourseRequest) => {
    try {
      setProcessingId(request.id)
      const result = await deleteJoinRequest(request.id)
      
      if (result.success) {
        toast.success('Permintaan berhasil dihapus')
        handleRefresh()
      } else {
        toast.error(result.error || 'Gagal menghapus permintaan')
      }
    } catch (error) {
      console.error('Error deleting request:', error)
      toast.error('Terjadi kesalahan saat menghapus permintaan')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Menunggu</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disetujui</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length

  return (
    <>
      <div className="gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Pending
              </Badge>
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Approved
              </Badge>
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Rejected
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Cari berdasarkan nama, email, atau kursus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Memuat...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Course Filter Badges */}
          {uniqueCourses.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={courseFilter === null ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => setCourseFilter(null)}
              >
                Semua Kursus ({requests.length})
              </Badge>
              {uniqueCourses.map((course) => (
                <Badge
                  key={course.id}
                  variant={courseFilter === course.id ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => setCourseFilter(course.id)}
                >
                  {course.title} ({course.count})
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              {requests.length === 0 ? (
                <>
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Belum Ada Permintaan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Belum ada siswa yang mengajukan permintaan untuk bergabung dengan kursus Anda.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Tidak Ada Hasil
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tidak ada permintaan yang cocok dengan filter yang dipilih.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Kursus</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lampiran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const hasDetails = request.message || request.contact || request.attachmentUrl || (request.status === 'REJECTED' && request.reason)
                  const isExpanded = expandedRows.has(request.id)
                  const timeAgo = formatDistanceToNow(new Date(request.createdAt), {
                    addSuffix: true,
                    locale: localeId
                  })

                  return (
                    <React.Fragment key={request.id}>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell>
                          {hasDetails && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 h-6 w-6"
                              onClick={() => toggleRowExpansion(request.id)}
                            >
                              <ChevronDown 
                                size={14} 
                                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              />
                            </Button>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {request.user.image ? (
                              <Image
                                src={request.user.image}
                                alt={request.user.name || 'User'}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                <User size={16} className="text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                {request.user.name || 'User Tanpa Nama'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {request.user.email} • {timeAgo}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm font-medium">{request.course.title}</div>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        
                        <TableCell>
                          {request.attachmentUrl ? (
                            <div 
                              className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded-md p-1 transition-colors"
                              onClick={() => {
                                setSelectedImage(request.attachmentUrl)
                                setIsImageModalOpen(true)
                              }}
                            >
                              <div className="relative w-8 h-8 bg-muted rounded overflow-hidden">
                                <Image
                                  src={request.attachmentUrl}
                                  alt="Attachment thumbnail"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Eye size={14} className="text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">-</div>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {request.status === 'PENDING' && (
                              <>
                                <Button
                                  onClick={() => handleApprove(request)}
                                  disabled={processingId === request.id}
                                  size="sm"
                                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check size={14} className="mr-1" />
                                  Setujui
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedRequest(request)
                                    setIsRejectModalOpen(true)
                                  }}
                                  disabled={processingId === request.id}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <X size={14} className="mr-1" />
                                  Tolak
                                </Button>
                              </>
                            )}

                            {request.status === 'APPROVED' && (
                              <Button
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setIsRevokeModalOpen(true)
                                }}
                                disabled={processingId === request.id}
                                variant="outline"
                                size="sm"
                                className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <UserX size={14} className="mr-1" />
                                Cabut
                              </Button>
                            )}

                            {request.status === 'REJECTED' && (
                              <Button
                                onClick={() => handleDelete(request)}
                                disabled={processingId === request.id}
                                variant="outline"
                                size="sm"
                                className="h-8 text-gray-600 border-gray-200 hover:bg-gray-50"
                                title="Hapus permintaan yang ditolak agar user dapat mengajukan permintaan baru"
                              >
                                <X size={14} className="mr-1" />
                                Hapus
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Details Row */}
                      {hasDetails && isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/20">
                            <div className="p-4 grid gap-4">
                              {request.message && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare size={14} className="text-muted-foreground" />
                                    <span className="text-sm font-medium">Pesan:</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground bg-background p-3 rounded-md border">
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
                                  <p className="text-sm text-muted-foreground bg-background p-3 rounded-md border">
                                    {request.contact}
                                  </p>
                                </div>
                              )}


                              {request.status === 'REJECTED' && request.reason && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <X size={14} className="text-red-500" />
                                    <span className="text-sm font-medium text-red-700">Alasan Penolakan:</span>
                                  </div>
                                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                    {request.reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Permintaan Bergabung</DialogTitle>
            <DialogDescription>
              Anda akan menolak permintaan dari {selectedRequest?.user.name || selectedRequest?.user.email}. 
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
                disabled={processingId !== null}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {rejectReason.length}/300 karakter
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false)
                setRejectReason('')
                setSelectedRequest(null)
              }}
              disabled={processingId !== null}
            >
              Batal
            </Button>
            <Button
              onClick={handleReject}
              disabled={processingId !== null}
              variant="destructive"
            >
              {processingId !== null ? 'Memproses...' : 'Tolak Permintaan'}
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
              Anda akan mencabut persetujuan untuk {selectedRequest?.user.name || selectedRequest?.user.email} dan menghapus mereka dari kursus. 
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
                disabled={processingId !== null}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {revokeReason.length}/300 karakter
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRevokeModalOpen(false)
                setRevokeReason('')
                setSelectedRequest(null)
              }}
              disabled={processingId !== null}
            >
              Batal
            </Button>
            <Button
              onClick={handleRevoke}
              disabled={processingId !== null}
              variant="destructive"
            >
              {processingId !== null ? 'Memproses...' : 'Cabut Persetujuan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] p-2">
            <DialogHeader className="px-4 py-2">
              <DialogTitle className="text-lg">Lampiran Detail</DialogTitle>
              <DialogDescription>
                Klik di luar gambar atau tekan Escape untuk menutup
              </DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-[70vh] overflow-hidden rounded-md">
              <Image
                src={selectedImage}
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
