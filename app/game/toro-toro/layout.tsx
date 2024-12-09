"use client"
import { ReactNode, useEffect } from "react"
import Script from "next/script"

export default function ToroToroLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Handle screenfit event
    window.addEventListener('screenfit', (event: any) => {
      const { width, height } = event.detail
      console.log(`Now @${width}x${height}`)
      document.documentElement.style.setProperty('--game-height', `${height}px`)
    })

    // Handle virtual keyboard
    const handleResize = () => {
      // Get visual viewport height
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      // Get offset from top of the page
      const offsetTop = window.visualViewport?.offsetTop || 0;
      
      // Update CSS variables for layout adjustments
      document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
      document.documentElement.style.setProperty('--viewport-offset-top', `${offsetTop}px`);
    };

    // Listen to viewport changes (including keyboard show/hide)
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    // Initial call
    handleResize();

    // Cleanup
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, [])

  return (
    <>
      <Script src="https://unpkg.com/screenfit" strategy="afterInteractive" />
      {children}
    </>
  )
}
