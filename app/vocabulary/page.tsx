import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  getVocabularyCollections 
} from "@/actions/vocabulary-actions"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  FolderIcon,
  PlusIcon,
  UserIcon,
  LockIcon,
  UnlockIcon,
  SearchIcon
} from "lucide-react"

export default async function VocabularyPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { success, data: collections, error } = await getVocabularyCollections()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Cari kumpulan kosakata..."
              className="pl-9 h-9 bg-background"
            />
            <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          </div>
          
          <Button asChild size="sm">
            <Link href="/vocabulary/create" className="flex items-center gap-1.5">
              <PlusIcon className="h-4 w-4" />
              <span>Buat Baru</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {success && collections?.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <FolderIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Belum Ada Kumpulan Kosakata
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Mulai buat kumpulan baru untuk menyimpan dan mempelajari kosakata bahasa Korea Anda!
          </p>
          <Button asChild>
            <Link href="/vocabulary/create">
              Buat Kumpulan Pertama
            </Link>
          </Button>
        </div>
      )}

      {/* Vocabulary Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {success && collections?.map((collection) => (
          <Link href={`/vocabulary/${collection.id}`} key={collection.id}>
            <Card className="group relative bg-card overflow-hidden rounded-lg border border-border transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1">
              <div className="relative h-32 w-full overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-primary/20 to-emerald-500/20">
                  {/* Decorative Orbs */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
                </div>
                
                {/* Top Row: Word Count and Privacy */}
                <div className="absolute top-2 inset-x-2 flex justify-between items-center">
                  <div className="px-2.5 py-1 rounded-full bg-primary/20 backdrop-blur-sm">
                    <span className="text-xs font-medium text-primary-foreground">
                      {collection.items.length} kata
                    </span>
                  </div>
                  <div className="p-1.5 rounded-full bg-background/50 backdrop-blur-sm">
                    {collection.isPublic ? (
                      <UnlockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <LockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Bottom Row: Author */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 backdrop-blur-sm">
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {collection.user?.name || 'Anonymous'}
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div>
                  <CardTitle className="text-lg font-bold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                    {collection.title}
                  </CardTitle>
                  {collection.description && (
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {collection.description}
                    </CardDescription>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
