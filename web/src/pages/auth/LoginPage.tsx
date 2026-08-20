import React from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { AuthFooter } from '@/components/auth/AuthFooter'

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome Back to Nearby"
      subtitle="Sign in to access your saved destination spots, custom AI itineraries, and real-time spatial radar."
    >
      <LoginForm />
      <AuthFooter
        promptText="Don't have an account yet?"
        linkText="Sign Up"
        linkHref="/register"
      />
    </AuthLayout>
  )
}

export default LoginPage
