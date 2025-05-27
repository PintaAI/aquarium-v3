"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { FaRocket, FaBookOpen, FaChalkboardTeacher, FaVideo } from "react-icons/fa";
import { ThemeToggle } from "../theme-toggle";
import { motion } from "framer-motion";

export const LandingHero = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Korean words with their meanings
  const koreanWords = [
    { word: "안녕하세요", romanized: "annyeonghaseyo", meaning: "hello" },
    { word: "감사합니다", romanized: "kamsahamnida", meaning: "thank you" },
    { word: "사랑해요", romanized: "saranghaeyo", meaning: "I love you" },
    { word: "공부해요", romanized: "gongbuhaeyo", meaning: "let's study" },
    { word: "화이팅", romanized: "hwaiting", meaning: "fighting/good luck" }
  ];
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative min-h-screen  overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/90 z-0" />
      
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20">
          <motion.svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 800" 
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 120, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <circle cx="400" cy="400" r="200" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="10 15" />
          </motion.svg>
          
          <motion.svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 800" 
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: -360 }}
            transition={{ 
              duration: 180, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0"
          >
            <circle cx="400" cy="400" r="300" fill="none" stroke="var(--secondary)" strokeWidth="1.5" strokeDasharray="5 10" />
          </motion.svg>
          
          <motion.svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 800 800" 
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: -360 }}
            transition={{ 
              duration: 90, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0"
          >
            <circle cx="400" cy="400" r="100" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="15 10" />
          </motion.svg>
        </div>
        
        {/* Animated Korean characters */}
        {koreanWords.map((word, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl font-bold text-primary/10 font-jua korean pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              x: `calc(${Math.sin(i * 45) * 20}vw + ${i * 10}vw)`,
              y: `calc(${Math.cos(i * 45) * 20}vh + ${i * 5}vh)`
            }}
            transition={{
              opacity: { 
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut" 
              },
              x: { 
                duration: 15 + i * 5,
                repeat: Infinity,
                ease: "easeInOut", 
                repeatType: "reverse"
              },
              y: { 
                duration: 20 + i * 3,
                repeat: Infinity,
                ease: "easeInOut", 
                repeatType: "reverse"
              }
            }}
          >
            {word.word}
          </motion.div>
        ))}
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="container relative z-1 mx-auto px-4 pt-12 pb-26">
        <div className="relative mt-0 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left column - Content */}
          <motion.div 
            className="lg:col-span-7 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
            className="flex flex-col lg:flex-row items-center justify-center lg:justify-start mb-8 lg:mb-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-md"></div>
                <Image 
                  src="/images/logoo.png"
                  alt="Pejuangkorea Logo"
                  width={84}
                  height={84}
                  className="relative rounded-full border-2 border-primary/20"
                />
              </div>
              <h1 className="mt-4 lg:mt-0 lg:ml-4 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-center lg:text-left">
                <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
                  Pejuang<span className="bg-gradient-to-r from-accent to-primary text-transparent bg-clip-text">korea Academy</span>
                </span>
              </h1>
            </motion.div>

            <motion.p 
              className="mt-6 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 text-foreground/80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="font-medium">Kuasai bahasa Korea</span> melalui pelajaran interaktif, 
              jalur pembelajaran yang dipersonalisasi, dan sesi latihan dunia nyata.
            </motion.p>

            {/* Korean example with tooltip */}
            <motion.div 
              className="mt-4 flex flex-wrap justify-center lg:justify-start gap-3 text-sm font-light text-foreground/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {koreanWords.slice(0, 3).map((item, i) => (
                <div key={i} className="relative group">
                  <div className="border border-primary/20 bg-background/50 backdrop-blur-sm rounded-full px-3 py-1 
                                 cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:scale-105">
                    <span className="font-jua korean">{item.word}</span>
                    <span className="ml-1 opacity-60">({item.romanized})</span>
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-card text-xs rounded
                               opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {item.meaning}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div 
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="relative overflow-hidden group/btn"
                asChild
              >
                <Link href="/auth/login">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-primary group-hover/btn:from-primary/90 group-hover/btn:to-primary transition-all duration-300"></span>
                  <span className="absolute -inset-px bg-gradient-to-r from-primary to-accent blur-sm opacity-30 group-hover/btn:opacity-60 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <FaRocket className="w-4 h-4" />
                    Daftar di sini
                  </span>
                </Link>
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
                asChild
              >
                <Link href="/courses">
                  <FaBookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
              
              <div className="relative group hidden sm:block">
                <Button 
                  size="lg"
                  variant="secondary"
                  className="hover:bg-secondary/90 transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard/live-session">
                    <FaVideo className="w-4 h-4 mr-2" />
                    Live Session
                  </Link>
                </Button>
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent animate-pulse"></div>
              </div>
              
              <Button 
                size="lg"
                variant="secondary"
                className="hover:bg-secondary/90 transition-all duration-300 sm:hidden"
                asChild
              >
                <Link href="/dashboard/live-session">
                  <FaVideo className="w-4 h-4 mr-2" />
                  Live Session
                </Link>
              </Button>
              
              <Button 
                size="lg"
                variant="ghost"
                className="hover:bg-muted/50 transition-all duration-300"
                asChild
              >
                <Link href="/dashboard/teach">
                  <FaChalkboardTeacher className="w-4 h-4 mr-2" />
                  Teach
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 text-sm text-foreground/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-3xl font-bold text-primary">5K+</span>
                <span>Active Students</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-3xl font-bold text-primary">250+</span>
                <span>Courses</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-3xl font-bold text-primary">99%</span>
                <span>Success Rate</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div 
            className="lg:col-span-5 relative z-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Decorative elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-secondary/10 to-accent/5 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,163,153,0.1),transparent_70%)]"></div>

            <div className="relative">
              {/* Floating decorative circles */}
              <motion.div 
                className="absolute top-12 -left-6 w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md z-10"
                animate={{ 
                  y: [0, -15, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-accent/30 backdrop-blur-md z-10"
                animate={{ 
                  y: [0, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Main image */}
              <div className="relative mx-auto lg:mx-0 max-w-sm lg:max-w-md perspective-1000">
                <motion.div 
                  className="relative z-10 rounded-full p-12 overflow-hidden shadow-2xl"
                  initial={{ rotateY: 15 }}
                  animate={{ rotateY: [15, -5, 15] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
                  <Image
                    src="/images/circle-logo.png"
                    alt="Korean Learning Platform"
                    width={700}
                    height={700}
                    className="w-full h-auto object-contain"
                    priority
                    quality={100}
                  />
                </motion.div>
                
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-xl opacity-70"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
