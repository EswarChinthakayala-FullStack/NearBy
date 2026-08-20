import React from 'react'
import { Link } from 'react-router-dom'

export interface AuthFooterProps {
  promptText: string
  linkText: string
  linkHref: string
  className?: string
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  promptText,
  linkText,
  linkHref,
  className = '',
}) => {
  return (
    <div className={`text-center text-xs text-muted-foreground pt-4 border-t border-border/60 mt-4 ${className}`}>
      {promptText}{' '}
      <Link to={linkHref} className="font-bold text-primary hover:underline">
        {linkText}
      </Link>
    </div>
  )
}

export default AuthFooter
