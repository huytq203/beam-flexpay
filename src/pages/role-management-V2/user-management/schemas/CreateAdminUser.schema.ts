import { z } from 'zod'

const USERNAME_PATTERN = /^[a-z0-9._-]+$/i
const PHONE_PATTERN = /^0[35789]\d{8}$/

export const CreateAdminUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Tên đăng nhập là bắt buộc')
    .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự')
    .regex(
      USERNAME_PATTERN,
      'Tên đăng nhập chỉ được chứa chữ cái, số và các ký tự . _ -'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Email là bắt buộc')
    .max(100, 'Email không được vượt quá 100 ký tự')
    .email('Email không đúng định dạng'),
  firstName: z
    .string()
    .trim()
    .min(1, 'Họ là bắt buộc')
    .max(50, 'Họ không được vượt quá 50 ký tự'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Tên đệm và tên là bắt buộc')
    .max(50, 'Tên đệm và tên không được vượt quá 50 ký tự'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(PHONE_PATTERN, 'Số điện thoại không đúng định dạng'),
  enabled: z.enum(['true', 'false'], {
    message: 'Trạng thái hoạt động là bắt buộc'
  }),
  roleIds: z.array(z.string())
})

export type CreateAdminUserFormData = z.infer<typeof CreateAdminUserSchema>
