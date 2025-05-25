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
      isCertificateEligible: true,
      tryoutParticipations: {
        select: {
          score: true,
          submittedAt: true, // For potential future use like sorting or display
          tryout: {
            select: {
              id: true, // Good to have for keys or links
              nama: true,
            },
          },
        },
        orderBy: {
          tryout: {
            nama: 'asc', // Order by tryout name
          },
        },
      },
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-foreground">
          Status Sertifikat Anda
        </h1>
        
        <Card className="max-w-2xl mx-auto shadow-xl rounded-[var(--radius-lg)] overflow-hidden">
          <CardHeader className="bg-muted p-6 border-b border-border">
            <CardTitle className="text-xl lg:text-2xl text-card-foreground">Informasi Peserta</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                <p className="text-lg text-card-foreground font-semibold">{user.name || "Nama belum diatur"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alamat Email</p>
                <p className="text-lg text-card-foreground font-semibold">{user.email}</p>
              </div>
              <div className="flex items-center justify-between pt-3">
                <p className="text-sm font-medium text-muted-foreground">Status Kelayakan Sertifikat</p>
                <Badge
                  variant={user.isCertificateEligible ? "default" : "destructive"}
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    user.isCertificateEligible 
                    ? "bg-green-500 text-white border-green-600" // Kept specific green for positive status
                    : "bg-destructive text-destructive-foreground border-destructive"
                  }`}
                >
                  {user.isCertificateEligible ? "MEMENUHI SYARAT" : "BELUM MEMENUHI SYARAT"}
                </Badge>
              </div>
            </div>

            <hr className="my-6 border-border" />

            {user.isCertificateEligible ? (
              <div className="rounded-[var(--radius-md)] border border-green-300 bg-green-50 p-6 text-center"> {/* Kept specific green for positive status callout */}
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-semibold text-green-700 mb-3">
                  Selamat, {user.name || "Peserta"}!
                </h3>
                <p className="text-green-600 mb-6 text-md">
                  Anda telah memenuhi semua persyaratan dan berhak untuk mendapatkan sertifikat kelulusan.
                </p>
                <Link
                  href={`/api/sertifikat/${session.user.id}`}
                  className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-[var(--radius-md)] hover:bg-green-700 transition-colors duration-150 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Unduh Sertifikat Saya
                </Link>
              </div>
            ) : (
              <div className="rounded-[var(--radius-md)] border border-amber-400 bg-amber-50 p-6 text-center"> {/* Kept specific amber for informational status callout */}
                 <div className="text-5xl mb-4">💡</div>
                <h3 className="text-2xl font-semibold text-amber-700 mb-3">Terus Semangat!</h3>
                <p className="text-amber-600 text-md mb-4">
                  Saat ini Anda belum memenuhi semua persyaratan untuk mendapatkan sertifikat.
                </p>
                <p className="text-sm text-muted-foreground"> {/* Used muted-foreground for this secondary text */}
                  Silakan lanjutkan pembelajaran Anda dan periksa kembali progres untuk melengkapi semua kriteria yang dibutuhkan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tryout Scores Section */}
        {user.tryoutParticipations && user.tryoutParticipations.length > 0 && (
          <Card className="max-w-2xl mx-auto shadow-xl rounded-[var(--radius-lg)] overflow-hidden mt-8">
            <CardHeader className="bg-muted p-6 border-b border-border">
              <CardTitle className="text-xl lg:text-2xl text-card-foreground">Riwayat Nilai Tryout</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-4">
              {user.tryoutParticipations.map((participation) => (
                <div 
                  key={participation.tryout.id} 
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-card-foreground font-medium">{participation.tryout.nama}</span>
                  <Badge
                    className="px-3 py-1 text-sm font-semibold"
                    variant={participation.score >= 70 ? "default" : "destructive"} // Example: score >= 70 is "good"
                  >
                    {participation.score}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {user.tryoutParticipations && user.tryoutParticipations.length === 0 && (
           <Card className="max-w-2xl mx-auto shadow-xl rounded-[var(--radius-lg)] overflow-hidden mt-8">
            <CardHeader className="bg-muted p-6 border-b border-border">
              <CardTitle className="text-xl lg:text-2xl text-card-foreground">Riwayat Nilai Tryout</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 text-center">
              <p className="text-muted-foreground">Belum ada nilai tryout yang tercatat untuk Anda.</p>
            </CardContent>
          </Card>
        )}
        
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PJKR Academy. Semua hak cipta dilindungi.</p>
          <p>Jika ada pertanyaan, hubungi <a href="mailto:rorezxez@gmail.com" className="text-primary hover:underline">rorezxez@gmail.com</a>.</p>
        </footer>
      </div>
    </div>
  )
}

export default SertifikatPage
