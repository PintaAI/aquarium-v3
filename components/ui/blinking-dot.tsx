"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface BlinkingDotProps {
  color?: "blue" | "emerald"
}

export function BlinkingDot({ color = "blue" }: BlinkingDotProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const baseColor = color === "blue" ? "bg-blue-500" : "bg-emerald-500"

  return (
    <div className="relative">
      <div className={cn(
        "w-3 h-3 rounded-full",
        baseColor,
        "transition-opacity duration-1000",
        isVisible ? "opacity-100" : "opacity-50"
      )} />
      <div className={cn(
        "absolute inset-0 w-3 h-3 rounded-full",
        baseColor,
        "animate-ping"
      )} />
    </div>
  )
}
