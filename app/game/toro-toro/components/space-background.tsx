'use client';

import React, { useMemo, useEffect, useState } from 'react';
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

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Nebula Background */}
      <div className="absolute inset-0 " />

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
      `}</style>
    </div>
  );
};

export default SpaceBackground;
