import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    toast.info('Signed out successfully')
    navigate('/')
  }

  if (!user) return null

  const displayName = user.full_name || user.name || 'User'
  const avatarSrc = user.avatar_url || user.avatarUrl

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-sm border border-border bg-card p-1 hover:border-emerald-500/50 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
        aria-label="User account menu"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-emerald-500/20 text-emerald-500 font-bold text-xs font-mono overflow-hidden">
          {avatarSrc ? (
            <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
          {displayName}
        </span>
        <Icon name="arrow-right" size="xs" className="text-muted-foreground rotate-90" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-sm border border-border bg-card shadow-xl p-2 z-50 space-y-1"
          >
            {/* User Profile Header */}
            <div className="p-2 border-b border-border space-y-0.5">
              <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  Administrator
                </span>
              )}
            </div>

            {/* Menu Links */}
            <Link
              to="/user/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Icon name="profile" size="xs" className="text-muted-foreground" />
              <span>Profile Settings</span>
            </Link>

            <Link
              to="/user/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Icon name="favorite" size="xs" className="text-rose-500" />
              <span>Saved Bookmarks</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <Icon name="admin" size="xs" />
                <span>Admin Console</span>
              </Link>
            )}

            <div className="pt-1 border-t border-border">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Icon name="close" size="xs" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserMenu
