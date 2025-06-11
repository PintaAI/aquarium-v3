'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { JoinRequestCard } from '@/components/courses/join-request-card'
import { Search, Filter } from 'lucide-react'
import { getAllJoinRequests } from '@/app/actions/join-request-actions'

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
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = 
        request.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.course.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [requests, searchTerm, statusFilter])

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

  const handleRequestUpdate = () => {
    handleRefresh()
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length

  return (
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

      {/* Requests List */}
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
        <div className="gap-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="mb-4">
              <JoinRequestCard
                request={request}
                onUpdate={handleRequestUpdate}
                showCourseInfo={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
