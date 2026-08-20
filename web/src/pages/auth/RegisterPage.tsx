import React from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthFooter } from '@/components/auth/AuthFooter'

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join Nearby to save regional travel guides, generate neural AI itineraries, and unlock offline map radar."
    >
      <RegisterForm />
      <AuthFooter
        promptText="Already have an account?"
        linkText="Sign In"
        linkHref="/login"
      />
    </AuthLayout>
  )
}

export default RegisterPage
