"use client";

import { useState, useEffect } from 'react';
import Hero from './hero';
import Fitur from './fitur';
import Cta from './cta';
import Testimoni from './testimoni';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { component: Hero, name: 'Hero' },
  { component: Fitur, name: 'Fitur' },
  { component: Testimoni, name: 'Testimoni' },
  { component: Cta, name: 'Call to Action' }
];

export default function Slideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Ganti slide setiap 5 detik

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const CurrentComponent = slides[currentSlide].component;

  return (
    <div className="relative w-full h-screen bg-background">
      {/* Slide Content */}
      <div className="w-full h-full">
        <CurrentComponent />
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary/20 hover:bg-primary/40 p-2 rounded-full"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary/20 hover:bg-primary/40 p-2 rounded-full"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-primary' : 'bg-primary/20'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Name */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary/20 px-4 py-2 rounded-full">
        <span className="text-white font-medium">{slides[currentSlide].name}</span>
      </div>
    </div>
  );
}
