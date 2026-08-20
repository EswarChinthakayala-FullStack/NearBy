import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export interface PasswordStrengthIndicatorProps {
  password?: string
  className?: string
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
  className = '',
}) => {
  if (!password) return null

  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  const score = [hasMinLength, hasUppercase, hasLowercase, hasNumberOrSpecial].filter(Boolean).length

  const getLabel = () => {
    if (score <= 1) return { text: 'Weak', color: 'bg-destructive text-destructive' }
    if (score === 2) return { text: 'Fair', color: 'bg-amber-500 text-amber-500' }
    if (score === 3) return { text: 'Good', color: 'bg-blue-500 text-blue-500' }
    return { text: 'Strong', color: 'bg-emerald-500 text-emerald-500' }
  }

  const labelInfo = getLabel()
  const percentage = (score / 4) * 100

  const requirements = [
    { label: 'At least 8 characters', met: hasMinLength },
    { label: 'Upper & lowercase letters', met: hasUppercase && hasLowercase },
    { label: 'At least 1 number or symbol', met: hasNumberOrSpecial },
  ]

  return (
    <div className={cn('space-y-2 pt-1', className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Password Strength:</span>
          <span className={cn('font-bold text-[11px] uppercase tracking-wider', labelInfo.color.split(' ')[1])}>
            {labelInfo.text}
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary/80 rounded-sm overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
            className={cn('h-full rounded-sm transition-colors', labelInfo.color.split(' ')[0])}
          />
        </div>
      </div>

      {/* Security Requirements Checklist */}
      <div className="grid grid-cols-1 gap-1 pt-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium">
            <Icon
              name={req.met ? 'check' : 'close'}
              size={12}
              className={req.met ? 'text-emerald-500' : 'text-muted-foreground/40'}
            />
            <span className={req.met ? 'text-foreground' : 'text-muted-foreground/70'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PasswordStrengthIndicator
