import { getAllJoinRequests } from '@/app/actions/join-request-actions'
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CourseRequestsClient } from './course-requests-client'


export default async function CourseRequestsPage() {
  const user = await currentUser()
  
  if (!user || user.role !== 'GURU') {
    redirect('/auth/login')
  }

  const result = await getAllJoinRequests()
  
  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Permintaan Bergabung Kursus</h1>
        <p className="text-muted-foreground">
          Kelola permintaan siswa untuk bergabung dengan kursus yang Anda buat
        </p>
      </div>

      <CourseRequestsClient initialRequests={result.requests || []} />
    </div>
  )
}
