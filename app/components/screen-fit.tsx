'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import React from 'react';

export default function ScreenFit() {
  useEffect(() => {
    // Mendengarkan event screenfit
    const handleScreenFit = ({ detail }: any) => {
      const { width, height } = detail;
      console.log(`Viewport sekarang: ${width}x${height}`);
    };

    window.addEventListener('screenfit', handleScreenFit);

    return () => {
      window.removeEventListener('screenfit', handleScreenFit);
    };
  }, []);

  return (
    <Script 
      src="https://unpkg.com/screenfit" 
      strategy="beforeInteractive"
    />
  );
}
