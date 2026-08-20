import React from 'react'
import { motion } from 'framer-motion'
import { cardShake } from '@/lib/motion-variants'

export interface AuthCardProps {
  children: React.ReactNode
  className?: string
  shake?: boolean
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  className = '',
  shake = false,
}) => {
  return (
    <motion.div
      variants={cardShake}
      initial="initial"
      animate={shake ? 'shake' : 'initial'}
      className={`w-full max-w-md space-y-6 rounded-sm border border-border/80 bg-card/90 backdrop-blur-xl p-8 shadow-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default AuthCard
