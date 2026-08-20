import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProfileForm } from '@/components/user/ProfileForm'
import { PasswordChangeForm } from '@/components/user/PasswordChangeForm'
import { HugeiconsIcon } from '@hugeicons/react'
import { UserIcon, Shield01Icon } from '@hugeicons/core-free-icons'

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        title="Profile & Security Settings"
        description="Manage your personal profile details, account avatar, and authentication security."
        breadcrumbs={[{ label: 'My Account' }, { label: 'Profile' }]}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-sm text-xs font-mono transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-xs'
              : 'bg-card/60 hover:bg-card border border-border/70 text-muted-foreground hover:text-foreground'
          }`}
        >
          <HugeiconsIcon icon={UserIcon} className="size-4" />
          <span>Personal Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-sm text-xs font-mono transition-all flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-xs'
              : 'bg-card/60 hover:bg-card border border-border/70 text-muted-foreground hover:text-foreground'
          }`}
        >
          <HugeiconsIcon icon={Shield01Icon} className="size-4" />
          <span>Password & Security</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'profile' ? <ProfileForm /> : <PasswordChangeForm />}
      </div>
    </div>
  )
}

export default ProfilePage
