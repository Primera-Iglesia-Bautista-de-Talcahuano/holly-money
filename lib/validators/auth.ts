import { z } from "zod"

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string()
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
  })

export const forgotPasswordSchema = z.object({
  email: z.email("Ingresa un email válido")
})

export type SetPasswordValues = z.infer<typeof setPasswordSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
