import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VocabularyTable } from "@/components/vocabulary/vocabulary-table";
import { getVocabularyCollection } from "@/actions/vocabulary-actions";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpenIcon,
  UserIcon,
  LockIcon,
  UnlockIcon,
  PencilIcon,
} from "lucide-react";

export default async function VocabularyDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Pastikan params.id sudah di-await
  const params = await props.params;
  const collectionId = parseInt(params.id);

  // Ambil detail collection menggunakan server action
  const { success: collectionSuccess, data: collection, error: collectionError } =
    await getVocabularyCollection(collectionId);

  if (!collectionSuccess || !collection) {
    redirect("/vocabulary");
  }

  // Verifikasi kepemilikan
  if (collection.userId !== user.id && !collection.isPublic) {
    redirect("/vocabulary");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-8">
      <Card>
        <div className="relative h-32 w-full overflow-hidden rounded-t-lg sm:h-40">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-primary/20 to-emerald-500/20">
            {/* Decorative Orbs */}
            <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full blur-2xl" />
          </div>

          {/* Top Row: Word Count and Privacy */}
          <div className="absolute top-2 inset-x-2 flex flex-wrap justify-between items-center sm:inset-x-4">
            <div className="px-2.5 py-1 rounded-full bg-primary/20 backdrop-blur-sm">
              <span className="text-xs sm:text-sm font-medium text-primary-foreground">
                {collection.items.length} kata
              </span>
            </div>
            <div className="p-1.5 rounded-full bg-background/50 backdrop-blur-sm">
              {collection.isPublic ? (
                <UnlockIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
              ) : (
                <LockIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
              )}
            </div>
          </div>

          {/* Bottom Row: Author */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 backdrop-blur-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                {collection.user?.name || "Anonymous"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <h1 className="text-lg sm:text-2xl font-bold mb-1">{collection.title}</h1>
          {collection.description && (
            <p className="text-sm sm:text-base text-muted-foreground">{collection.description}</p>
          )}
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row sm:flex-row sm:items-center justify-between">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <BookOpenIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            Daftar Kosakata
          </CardTitle>
          {collection.userId === user.id && (
            <div className="flex mt-4 sm:mt-0 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/vocabulary/create?edit=true&id=${collection.id}`}>
                  <PencilIcon className="h-4 w-4 " />
                </Link>
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {collection.items.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Kosakata</h3>
              <p className="text-sm text-muted-foreground">
                Kumpulan ini belum memiliki kosakata
              </p>
            </div>
          ) : (
            <VocabularyTable items={collection.items} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
