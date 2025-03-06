import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getLatestVocabularyCollections } from "@/app/actions/vocabulary-actions"
import { ChevronRight, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"

interface VocabularyCollection {
  id: number
  title: string
  createdAt: Date
  description: string | null
}

export async function VocabularyCollection() {
  const { data: collections } = await getLatestVocabularyCollections()

  if (!collections) return null

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Kosa Kata</CardTitle>
          <Link
            href="/vocabulary"
            className="text-sm font-medium text-muted-foreground hover:text-primary/80 transition-colors flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[210px] w-full rounded-md pr-4">
          <div className="space-y-3">
            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[210px] text-center space-y-4 bg-muted-foreground/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Anda belum memiliki koleksi kosa kata.</p>
                <Link
                  href="/vocabulary/create"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium dark:text-black text-secondary bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Koleksi
                </Link>
              </div>
            ) : (
              collections.map((collection: VocabularyCollection) => (
                <Link
                  key={collection.id}
                  href={`/vocabulary/${collection.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent/50 transition-all hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold line-clamp-1 text-foreground/90">{collection.title}</h3>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(collection.createdAt), { addSuffix: true, locale: id })}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground/90 line-clamp-2">
                      {collection.description || "Tidak ada deskripsi"}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

