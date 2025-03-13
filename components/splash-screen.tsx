'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000) // Show splash screen for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!showSplash) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black transition-opacity duration-500">
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 animate-pulse">
          <Image
            src="/images/circle-logo.png"
            alt="Pejuangkorea"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-primary animate-pulse">
          Pejuangkorea
        </h1>
      </div>
    </div>
  )
}
