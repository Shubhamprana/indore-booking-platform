"use client"

import { useState, useEffect, useRef, memo } from "react"

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  start?: number
}

const AnimatedCounter = memo(function AnimatedCounter({ 
  end, 
  duration = 2000, 
  suffix = "", 
  start = 0 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const startValue = count

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing function
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const newCount = Math.floor(easeOut * (end - startValue) + startValue)
      
      setCount(newCount)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isVisible, end, duration, count])

  // Format numbers efficiently
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <span ref={elementRef} className="tabular-nums font-bold">
      {formatNumber(count)}{suffix}
    </span>
  )
})

// Export both named and default for compatibility
export { AnimatedCounter }
export default AnimatedCounter

