"use client"

import { memo } from "react"

const FloatingElements = memo(function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Optimized floating elements - fewer elements, better performance */}
      <div 
        className="absolute top-20 left-10 w-16 h-16 bg-blue-200/20 rounded-full animate-float gpu-accelerated"
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="absolute top-40 right-20 w-12 h-12 bg-purple-200/20 rounded-lg animate-float-delayed gpu-accelerated"
        style={{ animationDelay: '1s' }}
      />
      <div 
        className="absolute bottom-40 left-20 w-10 h-10 bg-pink-200/20 rounded-full animate-float gpu-accelerated"
        style={{ animationDelay: '2s' }}
      />

      {/* Simplified gradient orbs with better performance */}
      <div 
        className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl gpu-accelerated"
        style={{ animation: 'float 8s ease-in-out infinite' }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-xl gpu-accelerated"
        style={{ animation: 'float-delayed 10s ease-in-out infinite', animationDelay: '3s' }}
      />
    </div>
  )
})

// Export both named and default for compatibility
export { FloatingElements }
export default FloatingElements
