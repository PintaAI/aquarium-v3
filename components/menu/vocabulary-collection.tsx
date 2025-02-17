import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getLatestVocabularyCollections } from "@/actions/vocabulary-actions";
import { ChevronRight } from "lucide-react";

interface VocabularyCollection {
  id: number;
  title: string;
  isPublic: boolean;
  items: Array<{ id: number }>;
}

export async function VocabularyCollection() {
  const { data: collections } = await getLatestVocabularyCollections();
  
  if (!collections) return null;

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-md">Kosa-Kata</CardTitle>
          <a
            href="/vocabulary"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md">
          <div className="space-y-4">
            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[150px] text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Kamu belum punya koleksi kosa-kata
                </p>
                <a
                  href="/vocabulary/create"
                  className="text-xs font-medium hover:underline text-primary"
                >
                  Tambah di sini
                </a>
              </div>
            ) : (
              collections.map((collection: VocabularyCollection) => (
              <a
                key={collection.id}
                href={`/vocabulary/${collection.id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium line-clamp-1">{collection.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {collection.items.length} words
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {collection.isPublic ? "Public" : "Private"}
                </Badge>
              </a>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
