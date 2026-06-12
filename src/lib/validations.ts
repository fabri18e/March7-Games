import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'El username debe tener al menos 3 caracteres')
      .max(30, 'El username no puede tener más de 30 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const postSchema = z.object({
  content: z
    .string()
    .min(1, 'El post no puede estar vacío')
    .max(400, 'Máximo 400 caracteres'),
})

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  display_name: z
    .string()
    .max(50, 'Máximo 50 caracteres')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(300, 'Máximo 300 caracteres')
    .optional()
    .or(z.literal('')),
})

export const gameSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'Máximo 100 caracteres'),
  description: z
    .string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type PostInput = z.infer<typeof postSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type GameInput = z.infer<typeof gameSchema>
