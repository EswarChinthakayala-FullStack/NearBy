import React from 'react'
import { useTheme } from 'next-themes'
import { Icon } from './Icon'
import { buttonPressVariants } from '@/lib/motion-variants'
import { motion } from 'framer-motion'

const emptySubscribe = () => () => {}

function useIsHydrated() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export interface ThemeToggleProps {
  variant?: 'buttons' | 'dropdown' | 'icon-only' | 'icon-buttons'
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'buttons',
  className = '',
}) => {
  const { theme, setTheme } = useTheme()
  const isHydrated = useIsHydrated()

  if (!isHydrated) {
    return (
      <div className={`h-9 w-28 animate-pulse rounded-sm bg-muted ${className}`} />
    )
  }

  if (variant === 'icon-only') {
    const isDark = theme === 'dark'
    return (
      <motion.button
        variants={buttonPressVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card text-foreground transition-colors hover:border-emerald-500/50 ${className}`}
        aria-label="Toggle theme"
      >
        <Icon name={isDark ? 'sun' : 'moon'} size="xs" />
      </motion.button>
    )
  }

  return (
    <div
      className={`inline-flex h-9 items-center gap-0.5 rounded-sm border border-border bg-card/80 p-0.5 backdrop-blur-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex h-7.5 w-8 items-center justify-center rounded-sm text-xs transition-colors ${
          theme === 'light'
            ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Light Theme"
        aria-label="Light Theme"
      >
        <Icon name="sun" size="xs" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex h-7.5 w-8 items-center justify-center rounded-sm text-xs transition-colors ${
          theme === 'dark'
            ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Dark Theme"
        aria-label="Dark Theme"
      >
        <Icon name="moon" size="xs" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`flex h-7.5 w-8 items-center justify-center rounded-sm text-xs transition-colors ${
          theme === 'system'
            ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="System Preference"
        aria-label="System Preference"
      >
        <Icon name="system" size="xs" />
      </button>
    </div>
  )
}

export default ThemeToggle
