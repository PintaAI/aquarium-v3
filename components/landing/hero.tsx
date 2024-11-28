"use client";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const features = [
    { icon: "🎯", text: "Pembelajaran Terstruktur" },
    { icon: "🎮", text: "Mini Games Interaktif" },
    { icon: "📝", text: "Latihan Praktis" },
    { icon: "🏆", text: "Sistem Level & Reward" },
  ];

  const decorativeLogos = [
    { size: 48, top: '10%', left: '15%', blur: 'blur-sm', opacity: 0.15, transform: 'translate3d(0, -10px, 0)' },
    { size: 64, top: '25%', right: '10%', blur: 'blur-sm', opacity: 0.2, transform: 'translate3d(0, 20px, 0)' },
    { size: 96, bottom: '30%', left: '5%', blur: 'blursm', opacity: 0.1, transform: 'translate3d(0, -15px, 0)' },
    { size: 72, top: '40%', right: '25%', blur: 'blur-sm', opacity: 0.25, transform: 'translate3d(0, 12px, 0)' },
    { size: 56, bottom: '15%', right: '15%', blur: 'blur-sm', opacity: 0.15, transform: 'translate3d(0, -8px, 0)' },
    { size: 80, top: '15%', left: '30%', blur: 'blur-sm', opacity: 0.2, transform: 'translate3d(0, 15px, 0)' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/images/korean-pattern.png')] opacity-5 bg-repeat" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />

      <div className="relative container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left z-10 animate-fadeIn">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-slideDown">
            🎉 Platform kursus Bakor #1 di Indonesia
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slideUp">
            <span className="bg-gradient-to-r from-primary via-emerald-700 to-secondary bg-clip-text text-transparent">
              Belajar Bahasa Korea
            </span>
            <br />
            <span className="text-3xl md:text-5xl">
              Lebih Menyenangkan
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mb-8 animate-slideUp">
            Pelajari bahasa Korea dengan cara yang interaktif dan menyenangkan. 
            Dari pemula hingga mahir, kami hadirkan pengalaman belajar yang disesuaikan 
            dengan kebutuhan Anda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slideUp">
            <Link 
              href="/courses" 
              className="group bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-full transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Mulai Belajar
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link 
              href="/game" 
              className="group bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground font-bold py-3 px-8 rounded-full transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Coba Mini Games
              <span className="group-hover:animate-bounce">🎮</span>
            </Link>
          </div>

          {/* Feature List */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-background/50 backdrop-blur-sm p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Decorative Elements */}
        <div className="flex-1 relative h-[500px] hidden lg:block">
          {/* Decorative Logos */}
          {decorativeLogos.map((logo, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                top: logo.top,
                left: logo.left,
                right: logo.right,
                bottom: logo.bottom,
              }}
            >
              <div 
                className="relative animate-parallax"
                style={{
                  width: `${logo.size}px`,
                  height: `${logo.size}px`,
                  transform: logo.transform,
                  transition: 'transform 3s ease-in-out',
                }}
              >
                <Image
                  src="/images/logoo.png"
                  alt="Decorative Logo"
                  fill
                  className={`${logo.blur} transition-all duration-1000`}
                  style={{ opacity: logo.opacity }}
                />
              </div>
            </div>
          ))}
          
          {/* Main Logo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/images/circle-logo.png"
              alt="Aquarium Logo"
              width={400}
              height={400}
              className="opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto fill-background"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L48 105C96 90 192 60 288 47.5C384 35 480 40 576 50C672 60 768 75 864 77.5C960 80 1056 70 1152 65C1248 60 1344 60 1392 60L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes parallax {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, var(--parallax-offset), 0); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out forwards;
        }
        .animate-parallax {
          animation: parallax 8s ease-in-out infinite;
          --parallax-offset: -20px;
        }
      `}</style>
    </div>
  );
}
