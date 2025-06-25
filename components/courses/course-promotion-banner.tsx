import Link from "next/link"

export function CoursePromotionBanner() {
  return (
    <Link 
      href="https://pejuangkorea.vercel.app/courses/46"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 hover:from-teal-500 hover:via-cyan-600 hover:to-blue-600 text-white text-center py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg animate-pulse"
    >
      <span className="font-bold text-black text-lg">
        🚀 BARU! Kelas Pemantapan EPS TOPIK 2025 - Daftar Sekarang klik di sini!
      </span>
    </Link>
  )
}
