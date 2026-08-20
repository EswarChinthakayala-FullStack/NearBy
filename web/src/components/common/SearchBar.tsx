import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  debounceMs?: number
  isLoading?: boolean
  showShortcut?: boolean
  autoFocus?: boolean
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value: initialValue = '',
  onChange,
  onSearch,
  placeholder = 'Search places, cities, categories...',
  debounceMs = 300,
  isLoading = false,
  showShortcut = true,
  autoFocus = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // Derived state sync for initialValue prop during render
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue)
    setSearchTerm(initialValue)
  }

  // Debounce handler
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) onChange(searchTerm)
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [searchTerm, debounceMs, onChange])

  // Keyboard shortcut listener (Press / or Ctrl+K to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.ctrlKey && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClear = () => {
    setSearchTerm('')
    if (onChange) onChange('')
    if (onSearch) onSearch('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchTerm)
    } else if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <Icon
        name="search"
        size="sm"
        className="absolute left-3 text-muted-foreground pointer-events-none z-10"
      />

      <Input
        ref={inputRef}
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="pl-9 pr-16 h-10 rounded-sm border-border/70 bg-background/80 focus:bg-background text-xs font-medium transition-all shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="Search input"
      />

      <div className="absolute right-3 flex items-center gap-1.5 z-10">
        {isLoading && (
          <Icon name="loading" size="xs" spinning className="text-primary" />
        )}

        {searchTerm && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm"
            aria-label="Clear search"
          >
            <Icon name="close" size={14} />
          </button>
        )}

        {showShortcut && !searchTerm && !isLoading && (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-muted px-1.5 text-[10px] font-mono text-muted-foreground select-none">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  )
}

export default SearchBar
