import { z } from 'zod'

export const PermissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Mã quyền không được để trống')
    .max(50, 'Mã quyền không được vượt quá 50 ký tự'),
  description: z
    .string()
    .trim()
    .max(150, 'Mô tả không được vượt quá 150 ký tự')
})

export type PermissionFormData = z.infer<typeof PermissionSchema>
