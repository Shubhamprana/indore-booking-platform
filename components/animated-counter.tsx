"use client"

import { useState, useEffect } from "react"

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
}

export function AnimatedCounter({ end, duration = 2000, suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated first
    setIsHydrated(true)
    
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, 100)

    return () => {
      clearTimeout(timer)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration])

  // Render static count until hydrated
  if (!isHydrated) {
    return (
      <span>
        0{suffix}
      </span>
    )
  }

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
