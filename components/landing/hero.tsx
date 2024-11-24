import Link from "next/link";

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary/20 to-background text-center p-8">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Belajar Bahasa Korea
      </h1>
      <p className="text-xl text-primary/80 max-w-2xl mb-8">
        Platform pembelajaran bahasa Korea yang interaktif dan menyenangkan untuk semua tingkatan
      </p>
      <Link 
        href="/courses" 
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-full transition-colors"
      >
        Mulai Belajar
      </Link>
    </div>
  );
}
