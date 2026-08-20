import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
      toast.success('Password reset instructions sent to your email!')
    }, 1000)
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your registered account email to receive security reset instructions"
    >
      {isSubmitted ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Icon name="sparkles" size="md" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-foreground">Check Your Email Inbox</h3>
            <p className="text-xs text-muted-foreground">
              We've dispatched password reset instructions to <span className="font-semibold text-foreground">{email}</span>.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/login">
              <Button variant="outline" size="sm" className="w-full rounded-sm gap-2">
                <Icon name="arrow-left" size="xs" />
                <span>Return to Sign In</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Registered Account Email</label>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-muted/40 p-2.5 text-xs">
              <Icon name="profile" size="xs" className="text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="w-full bg-transparent outline-none text-foreground"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="default" size="default" className="w-full rounded-sm gap-2" disabled={isLoading}>
            <Icon name="sparkles" size="xs" />
            <span>{isLoading ? 'Sending Link...' : 'Send Reset Link'}</span>
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs font-semibold text-emerald-400 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPasswordPage
