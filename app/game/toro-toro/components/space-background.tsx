'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { AudioController } from './audio-controller';

const generateStars = (
  count: number,
  sizeClass: string,
  animationClass: string,
  speedFactor: number = 1
) => {
  return [...Array(count)].map((_, i) => ({
    key: i,
    initialLeft: Math.random() * 100,
    initialTop: Math.random() * 100,
    animationDelay: Math.random() * 15,
    animationDuration: 8 + Math.random() * 4,
    sizeClass,
    animationClass,
    speedFactor,
  }));
};

const SpaceBackground = () => {
  const smallStars = useMemo(
    () => generateStars(100, 'w-0.5 h-0.5 bg-white/20', 'animate-twinkle', 0.2),
    []
  );
  const mediumStars = useMemo(
    () => generateStars(50, 'w-1 h-1 bg-white/30', 'animate-twinkle-delayed', 0.5),
    []
  );
  const largeStars = useMemo(
    () => generateStars(25, 'w-1.5 h-1.5 bg-white/40', 'animate-twinkle-slow', 0.8),
    []
  );
  const shootingStars = useMemo(
    () =>
      [...Array(3)].map((_, i) => ({
        key: i,
        initialLeft: Math.random() * 100,
        initialTop: Math.random() * 100,
        animationDelay: Math.random() * 30,
        animationDuration: 2 + Math.random() * 3,
        sizeClass: 'w-0.5 h-0.5 bg-white/50',
        animationClass: 'animate-shooting-star',
      })),
    []
  );

  const planets = useMemo(
    () =>
      [...Array(2)].map((_, i) => ({
        key: i,
        initialLeft: Math.random() * 80 + 10,
        initialTop: Math.random() * 80 + 10,
        sizeClass: 'w-8 h-8',
        animationClass: 'animate-planet',
        imageUrl: `/path-to-your-planet-image-${i + 1}.png`,
      })),
    []
  );

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) - 0.5;
      const y = (event.clientY / window.innerHeight) - 0.5;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderStars = (stars: Array<{
    key: number;
    initialLeft: number;
    initialTop: number;
    animationDelay: number;
    animationDuration: number;
    sizeClass: string;
    animationClass: string;
    speedFactor: number;
  }>) => {
    return stars.map((star) => {
      const transformX = mousePosition.x * 50 * star.speedFactor;
      const transformY = mousePosition.y * 50 * star.speedFactor;
      return (
        <div
          key={star.key}
          className={`absolute rounded-full ${star.sizeClass} ${star.animationClass}`}
          style={{
            left: `${star.initialLeft}%`,
            top: `${star.initialTop}%`,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`,
            transform: `translate(${transformX}px, ${transformY}px)`,
          }}
        />
      );
    });
  };

  const SpaceShip = () => (
    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 scale-75 animate-hover">
      <div className="relative">
        {/* Rear Wings */}
        <div className="absolute w-32 h-3 bg-white/90 -left-14 top-10 transform -skew-x-12" />
        <div className="absolute w-32 h-3 bg-white/90 -right-14 top-10 transform skew-x-12" />
        
        {/* Engine Boosters */}
        <div className="absolute w-4 h-6 bg-white/90 -left-16 top-8 transform rotate-45" />
        <div className="absolute w-4 h-6 bg-white/90 -right-16 top-8 transform -rotate-45" />

        {/* Main Body */}
        <div className="w-12 h-16 bg-white/90 relative">
          {/* Cockpit */}
          <div className="absolute w-6 h-6 bg-blue-400/90 left-3 top-2 rounded-sm" />
          
          {/* Body Details */}
          <div className="absolute w-8 h-1 bg-gray-200/80 left-2 top-9" />
          <div className="absolute w-8 h-1 bg-gray-200/80 left-2 top-11" />
          
          {/* Side Thrusters */}
          <div className="absolute w-2 h-4 bg-white/90 -left-2 bottom-2" />
          <div className="absolute w-2 h-4 bg-white/90 -right-2 bottom-2" />
        </div>

        {/* Front Wings */}
        <div className="absolute w-20 h-2 bg-white/90 -left-8 top-4 transform -skew-x-12" />
        <div className="absolute w-20 h-2 bg-white/90 -right-8 top-4 transform skew-x-12" />

        {/* Weapons */}
        <div className="absolute w-1 h-6 bg-white/90 left-2 -top-4" />
        <div className="absolute w-1 h-6 bg-white/90 right-2 -top-4" />

        {/* Engine Effects */}
        <div className="absolute w-2 h-4 bg-blue-500/80 left-3 bottom-0 animate-thrust opacity-80" />
        <div className="absolute w-2 h-4 bg-blue-500/80 right-3 bottom-0 animate-thrust opacity-80" />
        
        {/* Side Engine Effects */}
        <div className="absolute w-1 h-2 bg-blue-500/60 -left-2 bottom-2 animate-thrust-small opacity-60" />
        <div className="absolute w-1 h-2 bg-blue-500/60 -right-2 bottom-2 animate-thrust-small opacity-60" />

        {/* Shield Effect */}
        <div className="absolute w-full h-full -inset-4 border-2 border-blue-300/20 rounded-full opacity-20 animate-shield" />
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Background Music */}
      <AudioController 
        audioPath="/sound/background-vocabullary.mp3"
        autoPlay={true}
        loop={true}
      />

      {/* Nebula Background */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-center bg-cover opacity-20 animate-move-nebula"
          style={{ backgroundImage: 'url("/path-to-your-nebula-image.jpg")' }}
        />
      </div>

      {/* Layer of small twinkling stars */}
      <div className="absolute inset-0">
        {renderStars(smallStars)}
      </div>

      {/* Layer of medium twinkling stars */}
      <div className="absolute inset-0">
        {renderStars(mediumStars)}
      </div>

      {/* Layer of large twinkling stars */}
      <div className="absolute inset-0">
        {renderStars(largeStars)}
      </div>

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <div
          key={star.key}
          className={`absolute rounded-full ${star.sizeClass} ${star.animationClass}`}
          style={{
            left: `${star.initialLeft}%`,
            top: `${star.initialTop}%`,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`,
          }}
        />
      ))}

      {/* Planets */}
      {planets.map((planet) => (
        <div
          key={planet.key}
          className={`absolute ${planet.sizeClass} ${planet.animationClass}`}
          style={{
            left: `${planet.initialLeft}%`,
            top: `${planet.initialTop}%`,
            backgroundImage: `url(${planet.imageUrl})`,
            backgroundSize: 'cover',
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
          }}
        />
      ))}

      {/* Spaceship */}
      <SpaceShip />

      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

      {/* Add custom animations to global styles */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes shooting-star {
          0% { 
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          100% { 
            transform: translateX(-200px) translateY(200px);
            opacity: 0;
          }
        }

        @keyframes hover {
          0%, 100% { transform: translateY(0) translateX(-50%) scale(0.75); }
          50% { transform: translateY(-8px) translateX(-50%) scale(0.75); }
        }

        @keyframes thrust {
          0%, 100% { 
            height: 16px;
            opacity: 0.8;
          }
          50% { 
            height: 10px;
            opacity: 0.4;
          }
        }

        @keyframes thrust-small {
          0%, 100% { 
            height: 8px;
            opacity: 0.6;
          }
          50% { 
            height: 5px;
            opacity: 0.3;
          }
        }

        @keyframes shield {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.05);
          }
        }

        .animate-hover {
          animation: hover 3s ease-in-out infinite;
        }

        .animate-thrust {
          animation: thrust 0.5s ease-in-out infinite;
        }

        .animate-thrust-small {
          animation: thrust-small 0.5s ease-in-out infinite;
        }

        .animate-shield {
          animation: shield 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SpaceBackground;