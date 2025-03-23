import { Button } from "@/components/ui/button"
import { VocabularySearchDialog } from "@/components/vocabulary/vocabulary-search-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  getVocabularyCollections 
} from "@/app/actions/vocabulary-actions"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  FolderIcon,
  PlusIcon,
  BookText,
  MessageSquareText
} from "lucide-react"
import { VocabularyCard } from "@/components/card/vocabulary-card"

export default async function VocabularyPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { success, data: collections, error } = await getVocabularyCollections()

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="flex-1">
          <VocabularySearchDialog />
        </div>
        <Button asChild>
          <Link href="/vocabulary/create" className="flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" />
            <span>Buat Baru</span>
          </Link>
        </Button>
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

      {/* Vocabulary Collections Tabs */}
      <Tabs defaultValue="word" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="word" className="gap-2">
              <BookText className="h-4 w-4" />
              Kata
            </TabsTrigger>
            <TabsTrigger value="sentence" className="gap-2">
              <MessageSquareText className="h-4 w-4" />
              Kalimat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="word" className="m-0">
          <ScrollArea className="h-[600px] md:h-[980px] pr-4 -mr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {success && collections?.filter(collection => 
              collection.items.some(item => item.type === "WORD")
            ).map((collection) => (
              <Link href={`/vocabulary/${collection.id}`} key={collection.id} className="block">
                <VocabularyCard
                  title={collection.title}
                  description={collection.description}
                  user={collection.user}
                  items={collection.items.filter(item => item.type === "WORD")}
                  isPublic={collection.isPublic}
                  icon={collection.icon ?? "FaBook"}
                />
              </Link>
            ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sentence" className="m-0">
          <ScrollArea className="h-[600px] md:h-[980px] pr-4 -mr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {success && collections?.filter(collection => 
              collection.items.some(item => item.type === "SENTENCE")
            ).map((collection) => (
              <Link href={`/vocabulary/${collection.id}`} key={collection.id} className="block">
                <VocabularyCard
                  title={collection.title}
                  description={collection.description}
                  user={collection.user}
                  items={collection.items.filter(item => item.type === "SENTENCE")}
                  isPublic={collection.isPublic}
                  icon={collection.icon ?? "FaBook"}
                />
              </Link>
            ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
