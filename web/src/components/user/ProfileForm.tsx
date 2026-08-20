import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO, isValid } from 'date-fns'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/common/Icon'
import AvatarUploader from './AvatarUploader'
import AccountStatusBadge from './AccountStatusBadge'
import ProfileSkeleton from './ProfileSkeleton'
import OfflineBanner from '@/components/common/OfflineBanner'
import { useProfile, useUpdateProfile } from '@/hooks/useAuthHooks'
import { toast } from 'sonner'

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(150, 'Full name cannot exceed 150 characters'),
  phone: z
    .string()
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
  avatar_url: z
    .string()
    .nullable()
    .optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export interface ProfileFormProps {
  className?: string
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ className = '' }) => {
  const { data: user, isLoading: isProfileLoading, isError, refetch } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      avatar_url: null,
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || user.name || '',
        phone: user.phone || user.phone_number || '',
        avatar_url: user.avatar_url || user.avatarUrl || null,
      })
    }
  }, [user, reset])

  const onSubmit = (data: ProfileFormData) => {
    if (!navigator.onLine) {
      toast.error('You are currently offline. Please reconnect to save profile changes.')
      return
    }

    const trimmedName = data.full_name ? data.full_name.trim() : ''
    const trimmedPhone = data.phone ? data.phone.trim() : undefined

    updateProfileMutation.mutate(
      {
        full_name: trimmedName,
        phone: trimmedPhone,
        avatar_url: data.avatar_url || undefined,
      },
      {
        onSuccess: (updatedUser) => {
          reset({
            full_name: updatedUser.full_name || updatedUser.name || '',
            phone: updatedUser.phone || updatedUser.phone_number || '',
            avatar_url: updatedUser.avatar_url || updatedUser.avatarUrl || null,
          })
          toast.success('Profile details updated successfully!')
        },
        onError: () => {
          toast.error('Failed to update profile. Please try again.')
        },
      }
    )
  }

  if (isProfileLoading) {
    return <ProfileSkeleton />
  }

  if (isError || !user) {
    return (
      <div className="p-8 rounded-sm border border-destructive/30 bg-destructive/5 text-center space-y-3 max-w-xl mx-auto">
        <Icon name="error" size="lg" className="text-destructive mx-auto" />
        <h4 className="text-sm font-bold text-foreground">Unable to load profile data</h4>
        <p className="text-xs text-muted-foreground">
          We encountered an error communicating with the backend authentication service.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-sm text-xs font-semibold"
        >
          <Icon name="refresh" size="xs" className="mr-1.5" />
          Retry
        </Button>
      </div>
    )
  }

  // Formatted registration date
  let memberSince = 'N/A'
  if (user.created_at || user.createdAt) {
    try {
      const parsed = parseISO(user.created_at || user.createdAt || '')
      if (isValid(parsed)) {
        memberSince = format(parsed, 'MMMM d, yyyy')
      }
    } catch {
      memberSince = 'N/A'
    }
  }

  const isLoading = updateProfileMutation.isPending || isSubmitting

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 w-full ${className}`}
    >
      <OfflineBanner />

      {/* Header Info Card */}
      <div className="p-6 rounded-sm border border-border/80 bg-card shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <Controller
          name="avatar_url"
          control={control}
          render={({ field }) => (
            <AvatarUploader
              currentAvatarUrl={field.value}
              userName={user.full_name || user.name}
              onAvatarChange={(newUrl) => field.onChange(newUrl)}
              disabled={isLoading}
            />
          )}
        />

        <div className="flex flex-wrap items-center gap-2">
          <AccountStatusBadge type="status" value={user.is_active ?? true} />
          <AccountStatusBadge type="verification" value={user.is_verified ?? false} />
          <AccountStatusBadge type="role" value={user.role} />
        </div>
      </div>

      {/* Edit Details Form Card */}
      <div className="p-6 md:p-8 rounded-sm border border-border/80 bg-card shadow-xs space-y-6">
        <h4 className="text-sm font-bold text-foreground border-b border-border/60 pb-3 font-heading uppercase tracking-wide">
          Personal Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-full-name" className="text-xs font-bold text-foreground">
              Full Display Name <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="full_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="profile-full-name"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 focus:bg-background text-xs h-9"
                />
              )}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone Input */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone" className="text-xs font-bold text-foreground">
              Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="profile-phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 focus:bg-background text-xs h-9"
                />
              )}
            />
            {errors.phone && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Read-Only Email Field */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-email" className="text-xs font-bold text-foreground">
                Email Address
              </Label>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <Icon name="shield" size={10} /> Verified Account
              </span>
            </div>
            <div className="relative">
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                disabled
                className="rounded-sm border-border/60 bg-muted/40 text-muted-foreground text-xs h-9 cursor-not-allowed pr-10"
              />
              <Icon name="profile" size="xs" className="absolute right-3 top-2.5 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        {/* Member Metadata Footer & Action Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border/60">
          <div className="text-xs text-muted-foreground flex items-center gap-2 font-mono">
            <Icon name="clock" size="xs" />
            <span>Member since <span className="font-semibold text-foreground">{memberSince}</span></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  reset({
                    full_name: user.full_name || user.name || '',
                    phone: user.phone || user.phone_number || '',
                    avatar_url: user.avatar_url || user.avatarUrl || null,
                  })
                }
                disabled={isLoading}
                className="rounded-sm text-xs font-semibold h-9"
              >
                Discard Changes
              </Button>
            )}

            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-9 px-5 shadow-xs transition-all text-xs"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon name="loading" size="xs" spinning />
                  Saving Changes...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Icon name="check" size="xs" />
                  Save Profile Details
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.form>
  )
}

export default ProfileForm
