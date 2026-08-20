import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type ProfileAvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface ProfileAvatarProps {
  src?: string | null
  name?: string
  size?: ProfileAvatarSize
  className?: string
}

const SIZE_MAP: Record<ProfileAvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-sm',
  xl: 'w-20 h-20 text-base',
  '2xl': 'w-28 h-28 text-xl',
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'U'
    const parts = fullName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return fullName.substring(0, 2).toUpperCase()
  }

  const initials = getInitials(name)
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <Avatar className={cn('border border-border/70 shadow-sm shrink-0', sizeClasses, className)}>
      {src && <AvatarImage src={src} alt={name} className="object-cover" />}
      <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 text-primary font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export default ProfileAvatar
