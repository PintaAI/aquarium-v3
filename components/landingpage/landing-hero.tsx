import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { FaRocket, FaBookOpen, FaChalkboardTeacher, FaVideo } from "react-icons/fa";
import { ThemeToggle } from "../theme-toggle";

export const LandingHero = () => {
  return (
    <div className="relative min-h-screen bg-[var(--primary)]">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-[var(--primary-foreground)] mb-6">
              Learn Korean with{' '}
              <span className="flex items-center">
                <Image 
                  src="/images/logoo.png"
                  alt="Pejuangkorea Logo"
                  width={90}
                  height={90}
                  className="mr-0"
                />
                <span className="bg-gradient-to-r from-[#0b7761] to-[#13c79d] text-transparent bg-clip-text"> 
                  Pejuangkorea
                </span>
              </span>
            </h1>
            <p className="text-lg text-[var(--primary-foreground)] mb-8 max-w-2xl">
              Kuasai bahasa Korea melalui pelajaran interaktif, jalur 
              pembelajaran yang dipersonalisasi, dan sesi latihan dunia nyata.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button size="lg" className="flex items-center gap-2" asChild>
                  <Link href="/auth/login">
                    <FaRocket className="w-4 h-4" />
                    Daftar di sini
                  </Link>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/courses">
                    <FaBookOpen className="w-4 h-4" />
                    Browse Courses
                  </Link>
                </Button>
                <Button 
                  size="lg"
                  variant="secondary"
                  className="flex items-center gap-2"
                  asChild
                >
                </Button>
                <Button 
                  size="lg"
                  variant="secondary"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/dashboard/live-session">
                    <FaVideo className="w-4 h-4" />
                    Live Session
                  </Link>
                </Button>
                <Button 
                  size="lg"
                  variant="secondary"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/dashboard/teach">
                    <FaChalkboardTeacher className="w-4 h-4" />
                    Teach
                  </Link>
                </Button>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-xl mx-auto">
              <Image
                src="/images/circle-logo.png"
                alt="Korean Learning Platform"
                width={600}
                height={500}
                className="w-full h-auto object-contain rounded-full shadow-2xl"
                priority
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
