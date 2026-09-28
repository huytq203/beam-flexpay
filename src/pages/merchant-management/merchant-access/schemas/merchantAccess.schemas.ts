import { z } from 'zod'

export const merchantUserSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100),
  email: z.email('Email không hợp lệ').max(100),
  phone: z
    .string()
    .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'),
  merchantIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một Merchant')
})
export type MerchantUserForm = z.infer<typeof merchantUserSchema>

export const merchantRoleSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(
      /^[A-Z][A-Z0-9_]{1,49}$/,
      'Mã gồm 2–50 ký tự in hoa, số hoặc dấu gạch dưới'
    ),
  name: z.string().trim().min(1, 'Vui lòng nhập tên nhóm quyền').max(100),
  description: z.string().trim().min(1, 'Vui lòng nhập mô tả').max(300),
  merchantId: z.string().min(1, 'Vui lòng chọn phạm vi')
})
export type MerchantRoleForm = z.infer<typeof merchantRoleSchema>
