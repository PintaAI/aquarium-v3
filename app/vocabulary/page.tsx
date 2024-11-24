import { getVocabularyCollections } from "@/actions/vocabulary-actions"
import { currentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function VocabularyPage() {
  const user = await currentUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { success, data: collections, error } = await getVocabularyCollections()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kumpulan Kosakata Saya</h1>
        <Link
          href="/vocabulary/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Buat Kumpulan Baru
        </Link>
      </div>
      
      {/* Tampilkan error jika ada */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tampilkan collections */}
      {success && collections?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            Anda belum memiliki kumpulan kosakata.
          </p>
          <p className="text-gray-500">
            Mulai buat kumpulan baru untuk menyimpan kosakata bahasa Korea Anda!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {success && collections?.map((collection) => (
          <div 
            key={collection.id}
            className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
          >
            <h2 className="text-xl font-semibold mb-2">{collection.title}</h2>
            {collection.description && (
              <p className="text-gray-600 mb-4">{collection.description}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {collection.items.length} kata
              </span>
              <Link
                href={`/vocabulary/${collection.id}`}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Lihat Detail →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
