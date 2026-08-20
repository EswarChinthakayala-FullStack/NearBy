import { z } from 'zod'

/**
 * Standard Email Schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email address is required')
  .email('Please enter a valid email address (e.g., name@example.com)')
  .transform((val) => val.trim().toLowerCase())

/**
 * Standard Password Schema (min 8 characters)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password cannot exceed 100 characters')

/**
 * User Full Name Schema
 */
export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters long')
  .max(150, 'Full name cannot exceed 150 characters')
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, { message: 'Full name cannot be blank' })

/**
 * Optional Phone Number Schema
 */
export const phoneSchema = z
  .string()
  .max(20, 'Phone number cannot exceed 20 characters')
  .optional()
  .or(z.literal(''))

/**
 * Login Form Validation Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginSchemaType = z.infer<typeof loginSchema>

/**
 * Register Form Validation Schema with Password Confirmation
 */
export const registerSchema = z
  .object({
    full_name: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type RegisterSchemaType = z.infer<typeof registerSchema>

/**
 * Change Password Validation Schema
 */
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: passwordSchema,
    confirm_new_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'New passwords do not match',
    path: ['confirm_new_password'],
  })

export type PasswordChangeSchemaType = z.infer<typeof passwordChangeSchema>
