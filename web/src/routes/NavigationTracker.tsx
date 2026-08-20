import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTE_CONFIG } from './RouteConfig'

export const NavigationTracker: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    // 1. Dynamic Document Title Update
    const currentPath = location.pathname
    const matchedConfig = Object.values(ROUTE_CONFIG).find((config) => {
      if (config.path === currentPath) return true
      if (config.path.includes(':') && currentPath.startsWith(config.path.split('/:')[0])) return true
      return false
    })

    if (matchedConfig) {
      document.title = matchedConfig.title
    } else {
      document.title = 'Nearby — AI Travel Guidance & Location Intelligence'
    }

    // 2. Scroll Restoration & Hash Navigation
    if (location.hash) {
      const targetId = location.hash.replace('#', '')
      const element = document.getElementById(targetId)
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: offsetTop, behavior: 'smooth' })
        return
      }
    }

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname, location.hash])

  return null
}

export default NavigationTracker
