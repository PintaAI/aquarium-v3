import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { FaRocket, FaBookOpen, FaChalkboardTeacher, FaVideo, FaTachometerAlt } from "react-icons/fa";

export const LandingHero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Learn Korean with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400"> 
                Pejuangkorea
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              Master Korean language through interactive lessons, personalized 
              learning paths, and real-world practice sessions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button size="lg" className="flex items-center gap-2" asChild>
                  <Link href="/auth/login">
                    <FaRocket className="w-4 h-4" />
                    Get Started Free
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
                  <Link href="/dashboard">
                    <FaTachometerAlt className="w-4 h-4" />
                    Dashboard
                  </Link>
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
