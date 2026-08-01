import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Vui lòng nhập email'),
  password: z.string().trim().min(1, 'Vui lòng nhập mật khẩu')
})

export type LoginFormData = z.infer<typeof loginSchema>
