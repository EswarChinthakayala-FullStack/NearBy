import React from 'react'
import { motion } from 'framer-motion'

export const TravelLines: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-15 z-0">
      <svg className="h-full w-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M-100 200 C 300 50, 700 400, 1540 100"
          stroke="url(#lineGrad1)"
          strokeWidth="2"
          strokeDasharray="8 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M-100 600 C 400 800, 900 300, 1540 700"
          stroke="url(#lineGrad2)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0" />
            <stop offset="50%" stopColor="#0D9488" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
            <stop offset="50%" stopColor="#0D9488" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
