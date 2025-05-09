import { getRequiredSession } from "@/lib/session"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

async function SertifikatPage() {
  const session = await getRequiredSession()
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      isCertificateEligible: true
    }
  })

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-destructive">Error</h1>
        <p className="text-destructive">User not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">Status Sertifikat</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Peserta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-muted-foreground">Nama</span>
            <span className="font-medium">{user.name || "Nama belum diatur"}</span>
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-muted-foreground">Status Kelayakan</span>
            <Badge 
              variant={user.isCertificateEligible ? "default" : "destructive"}
              className={user.isCertificateEligible ? "bg-primary" : ""}
            >
              {user.isCertificateEligible ? "Memenuhi Syarat" : "Belum Memenuhi Syarat"}
            </Badge>
          </div>

          {user.isCertificateEligible ? (
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-muted-foreground mb-4">
                Selamat! Anda telah memenuhi syarat untuk mendapatkan sertifikat.
              </p>
              <Link 
                href={`/api/sertifikat/${session.user.id}`}
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Unduh Sertifikat
              </Link>
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-muted-foreground">
                Untuk mendapatkan sertifikat, Anda perlu menyelesaikan semua persyaratan yang ditentukan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SertifikatPage
