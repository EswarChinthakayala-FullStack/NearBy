import React from 'react'

export interface AuthHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`text-center space-y-1.5 ${className}`}>
      <h1 className="text-2xl font-black font-heading tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export default AuthHeader
