import { cn } from '@/lib/utils'

interface RequestStatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  className?: string
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Menunggu Persetujuan',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'APPROVED':
        return {
          label: 'Disetujui',
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'REJECTED':
        return {
          label: 'Ditolak',
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
        config.className,
        className
      )}
    >
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          status === 'PENDING' && 'bg-yellow-500',
          status === 'APPROVED' && 'bg-green-500',
          status === 'REJECTED' && 'bg-red-500'
        )}
      />
      {config.label}
    </span>
  )
}
