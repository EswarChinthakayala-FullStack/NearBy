import React, { useEffect, useState } from 'react'
import { Icon } from '@/components/common/Icon'

export interface TOCItem {
  id: string
  title: string
  level?: number
}

export interface TableOfContentsProps {
  items: TOCItem[]
  className?: string
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, className = '' }) => {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120

      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id)
        if (element) {
          const top = element.offsetTop
          if (scrollPosition >= top) {
            setActiveId(items[i].id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setActiveId(id)
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 90
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
  }

  if (items.length === 0) return null

  return (
    <nav
      className={`rounded-sm border border-border/80 bg-card/60 p-4 backdrop-blur-md space-y-3 ${className}`}
      aria-label="Table of contents"
    >
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Icon name="list" size="xs" className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
          On This Page
        </span>
      </div>

      <ul className="space-y-1.5 text-xs">
        {items.map((item) => {
          const isActive = activeId === item.id
          return (
            <li key={item.id} style={{ paddingLeft: item.level ? `${(item.level - 1) * 12}px` : '0px' }}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`group flex items-center justify-between py-1 px-2 rounded-sm transition-all ${
                  isActive
                    ? 'bg-primary/10 font-bold text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span className="truncate">{item.title}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
