"use client";

import { ReactNode, useEffect } from "react";
import Script from "next/script";

interface LayoutProps {
  children: ReactNode;
}

export default function ToroToroLayout({ children }: LayoutProps) {
  useEffect(() => {
    const handleScreenFit = (event: any) => {
      document.body.className = 'fit';
      console.log('Screenfit height:', event.detail.height);
    };

    window.addEventListener('screenfit', handleScreenFit);
    
    return () => {
      window.removeEventListener('screenfit', handleScreenFit);
    };
  }, []);

  return (
    <>
      <Script 
        src="https://unpkg.com/screenfit" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Screenfit script loaded');
        }}
      />
      <style jsx global>{`
        body {
          opacity: 0;
          transition: opacity .3s ease-in;
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        
        body.fit {
          opacity: 1;
        }

        #__next {
          width: 100%;
          height: 100%;
        }
      `}</style>
      <div style={{ width: '100%', height: '100vh' }}>
        {children}
      </div>
    </>
  );
}
