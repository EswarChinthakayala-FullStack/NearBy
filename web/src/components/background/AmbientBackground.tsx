import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

export interface AmbientBackgroundProps {
  className?: string
  absolute?: boolean
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ className = '', absolute = false }) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDarkClass, setIsDarkClass] = useState(true)

  useEffect(() => {
    setMounted(true)
    const checkClass = () => {
      const isLight = document.documentElement.classList.contains('light')
      setIsDarkClass(!isLight)
    }
    checkClass()
    const observer = new MutationObserver(checkClass)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const isDark = mounted ? resolvedTheme === 'dark' || (resolvedTheme === undefined && isDarkClass) : isDarkClass

  return (
    <div
      className={`${absolute ? 'absolute' : 'fixed'} inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none transition-colors duration-500 ${
        isDark ? 'bg-[#050505]' : 'bg-[#f4fbf7]'
      } ${className}`}
    >
      {/* Layer 1: Full-viewport multi-point vibrant radial mesh */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-500"
        style={{
          background: isDark
            ? `
            radial-gradient(ellipse 120% 80% at 50% -10%, rgba(16, 185, 129, 0.24) 0%, transparent 70%),
            radial-gradient(ellipse 90% 70% at 5% 50%, rgba(16, 185, 129, 0.16) 0%, transparent 65%),
            radial-gradient(ellipse 90% 70% at 95% 50%, rgba(20, 184, 166, 0.16) 0%, transparent 65%),
            radial-gradient(ellipse 120% 80% at 50% 110%, rgba(16, 185, 129, 0.20) 0%, transparent 70%)
          `
            : `
            radial-gradient(ellipse 120% 80% at 50% -10%, rgba(16, 185, 129, 0.20) 0%, transparent 70%),
            radial-gradient(ellipse 90% 70% at 5% 50%, rgba(52, 211, 153, 0.14) 0%, transparent 65%),
            radial-gradient(ellipse 90% 70% at 95% 50%, rgba(20, 184, 166, 0.14) 0%, transparent 65%),
            radial-gradient(ellipse 120% 80% at 50% 110%, rgba(16, 185, 129, 0.18) 0%, transparent 70%)
          `,
        }}
      />

      {/* Layer 2: Central glowing Emerald core behind card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1000px] h-[800px] sm:h-[1000px] rounded-sm blur-[140px] pointer-events-none transition-all duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.24) 0%, rgba(5, 150, 105, 0.12) 45%, transparent 75%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.08) 45%, transparent 75%)',
        }}
      />

      {/* Layer 3: Floating high-intensity luminous halos */}
      <div
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-sm blur-[140px] transition-all duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.26) 0%, rgba(20, 184, 166, 0.14) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(20, 184, 166, 0.08) 40%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-[20%] -left-48 w-[700px] h-[700px] rounded-sm blur-[130px] transition-all duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute top-[40%] -right-48 w-[700px] h-[700px] rounded-sm blur-[130px] transition-all duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-sm blur-[140px] transition-all duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.20) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, transparent 65%)',
        }}
      />

      {/* Layer 4: Full-width Emerald hex grid lines */}
      <svg className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isDark ? 'opacity-[0.16]' : 'opacity-[0.12]'}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="scan-hex-grid-glow" width="60" height="52" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z" fill="none" stroke={isDark ? '#10b981' : '#059669'} strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scan-hex-grid-glow)" />
      </svg>

      {/* Layer 5: Fine dot matrix texture overlay */}
      <svg className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isDark ? 'opacity-[0.12]' : 'opacity-[0.08]'}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="scan-dot-texture-glow" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.2" fill={isDark ? '#ffffff' : '#059669'} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scan-dot-texture-glow)" />
      </svg>

      {/* Layer 6: Soft full-screen edge vignette */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-500"
        style={{
          background: isDark
            ? `radial-gradient(circle at 50% 50%, transparent 35%, rgba(5, 5, 5, 0.45) 100%)`
            : `radial-gradient(circle at 50% 50%, transparent 35%, rgba(236, 253, 245, 0.50) 100%)`,
        }}
      />
    </div>
  )
}

export default AmbientBackground
