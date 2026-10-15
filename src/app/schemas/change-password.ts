import { z } from 'zod'

const PASSWORD_MAX_LENGTH = 128
const ALLOWED_PASSWORD_CHARACTERS = /^[A-Za-z\d@$!%*?&]+$/

export const CHANGE_PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Ít nhất 10 ký tự',
    test: (value: string) =>
      value.length >= 10 && value.length <= PASSWORD_MAX_LENGTH
  },
  {
    id: 'uppercase',
    label: 'Có ít nhất 1 chữ hoa (A-Z)',
    test: (value: string) => /[A-Z]/.test(value)
  },
  {
    id: 'lowercase',
    label: 'Có ít nhất 1 chữ thường (a-z)',
    test: (value: string) => /[a-z]/.test(value)
  },
  {
    id: 'number',
    label: 'Có ít nhất 1 chữ số (0-9)',
    test: (value: string) => /\d/.test(value)
  },
  {
    id: 'special',
    label: 'Có ít nhất 1 ký tự đặc biệt (@$!%*?&)',
    test: (value: string) => /[@$!%*?&]/.test(value)
  }
] as const

const currentPasswordSchema = z
  .string()
  .min(1, 'Vui lòng nhập mật khẩu hiện tại')
  .max(PASSWORD_MAX_LENGTH, 'Mật khẩu không được vượt quá 128 ký tự')

const newPasswordSchema = z
  .string()
  .min(1, 'Vui lòng nhập mật khẩu mới')
  .min(10, 'Mật khẩu mới phải có ít nhất 10 ký tự')
  .max(PASSWORD_MAX_LENGTH, 'Mật khẩu mới không được vượt quá 128 ký tự')
  .regex(ALLOWED_PASSWORD_CHARACTERS, 'Mật khẩu chứa ký tự không được hỗ trợ')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/\d/, 'Mật khẩu phải có ít nhất 1 chữ số')
  .regex(/[@$!%*?&]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt')

export const adminChangePasswordSchema = z
  .object({
    oldPassword: currentPasswordSchema,
    newPassword: newPasswordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng nhập lại mật khẩu mới')
      .max(PASSWORD_MAX_LENGTH, 'Mật khẩu không được vượt quá 128 ký tự')
  })
  .superRefine((values, context) => {
    if (values.newPassword === values.oldPassword) {
      context.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại'
      })
    }

    if (values.confirmPassword !== values.newPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp'
      })
    }
  })

export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>
