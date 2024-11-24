import { getVocabularyItems } from "@/actions/vocabulary-actions"
import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import VocabularyForm from "@/app/vocabulary/[id]/vocabulary-form"
import VocabularyActions from "@/app/vocabulary/[id]/vocabulary-actions"

export default async function VocabularyDetailPage({
  params
}: {
  params: { id: string }
}) {
  const user = await currentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const collectionId = parseInt(params.id)
  
  // Ambil detail collection
  const collection = await db.vocabularyCollection.findUnique({
    where: { id: collectionId }
  })

  if (!collection) {
    redirect("/vocabulary")
  }

  // Verifikasi kepemilikan
  if (collection.userId !== user.id) {
    redirect("/vocabulary")
  }

  // Ambil semua item dalam collection
  const { success, data: items, error } = await getVocabularyItems(collectionId)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/vocabulary"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold">{collection.title}</h1>
      </div>

      {collection.description && (
        <p className="text-gray-600 mb-8">{collection.description}</p>
      )}

      {/* Form untuk menambah kosakata baru */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tambah Kosakata Baru</h2>
        <VocabularyForm collectionId={collectionId} />
      </div>

      {/* Tampilkan error jika ada */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Daftar kosakata */}
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-4 gap-4 p-4 font-semibold border-b">
          <div>Korea</div>
          <div>Indonesia</div>
          <div>Kategori</div>
          <div className="text-right">Aksi</div>
        </div>
        
        {success && items?.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Belum ada kosakata dalam kumpulan ini
          </div>
        ) : (
          <div className="divide-y">
            {success && items?.map((item) => (
              <div key={item.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                <div>{item.korean}</div>
                <div>{item.indonesian}</div>
                <div>{item.category}</div>
                <div className="text-right">
                  <VocabularyActions item={item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
