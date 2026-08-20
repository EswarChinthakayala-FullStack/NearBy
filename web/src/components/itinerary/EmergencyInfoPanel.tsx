import React from 'react'
import type { EmergencyContacts } from '@/services/api/aiApi'
import { HugeiconsIcon } from '@hugeicons/react'
import { SecurityIcon } from '@hugeicons/core-free-icons'

interface EmergencyInfoPanelProps {
  emergency: EmergencyContacts
}

export const EmergencyInfoPanel: React.FC<EmergencyInfoPanelProps> = ({ emergency }) => {
  return (
    <div className="p-6 rounded-sm border border-rose-500/30 bg-rose-500/5 shadow-md space-y-4">
      <div className="flex items-center gap-2 border-b border-rose-500/20 pb-3 text-rose-400">
        <HugeiconsIcon icon={SecurityIcon} className="size-4" />
        <h3 className="text-base font-bold font-heading">Emergency Services & Contacts</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3 rounded-sm border border-border bg-card space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Hospitals</span>
          <p className="text-foreground font-semibold">{emergency.hospitals[0] || 'City General Hospital'}</p>
        </div>

        <div className="p-3 rounded-sm border border-border bg-card space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase">Police Station</span>
          <p className="text-foreground font-semibold">{emergency.police || 'Central Police Patrol'}</p>
        </div>

        <div className="p-3 rounded-sm border border-border bg-card space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase">24/7 Pharmacy</span>
          <p className="text-foreground font-semibold">{emergency.pharmacy || 'MedPlus Pharmacy'}</p>
        </div>

        <div className="p-3 rounded-sm border border-border bg-card space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase">ATM Kiosk</span>
          <p className="text-foreground font-semibold">{emergency.atm || '24/7 National Bank ATM'}</p>
        </div>
      </div>
    </div>
  )
}

export default EmergencyInfoPanel
