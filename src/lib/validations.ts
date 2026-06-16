import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot be more than 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
    email: z.string().email('Invalid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const postSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(400, 'Maximum 400 characters'),
})

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Must be at least 3 characters')
    .max(30, 'Cannot be more than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  display_name: z
    .string()
    .max(50, 'Cannot be more than 50 characters')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(300, 'Cannot be more than 300 characters')
    .optional()
    .or(z.literal('')),
})

export const gameSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Maximum 100 characters'),
  description: z
    .string()
    .max(1000, 'Maximum 1000 characters')
    .optional()
    .or(z.literal('')),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type PostInput = z.infer<typeof postSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type GameInput = z.infer<typeof gameSchema>
