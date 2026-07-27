import { z } from 'zod'
import { PASSWORD_RULES } from './constant/constants'

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .refine((value) => PASSWORD_RULES.every((rule) => rule.test(value)), {
        message: 'Mật khẩu chưa đạt đủ điều kiện bên dưới'
      }),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu mới')
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp'
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
