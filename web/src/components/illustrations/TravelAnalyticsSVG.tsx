import React from 'react'

export const TravelAnalyticsSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full max-w-sm h-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="360" height="240" rx="4" fill="#18181B" stroke="#10B981" strokeWidth="1.5" />

        {/* Analytics Bar Chart */}
        <rect x="60" y="160" width="30" height="80" rx="3" fill="#10B981" fillOpacity="0.4" />
        <rect x="110" y="120" width="30" height="120" rx="3" fill="#10B981" />
        <rect x="160" y="90" width="30" height="150" rx="3" fill="#059669" />
        <rect x="210" y="140" width="30" height="100" rx="3" fill="#F59E0B" />
        <rect x="260" y="70" width="30" height="170" rx="3" fill="#10B981" />
        <rect x="310" y="110" width="30" height="130" rx="3" fill="#059669" />
      </svg>
    </div>
  )
}
