import { z } from 'zod'

export const entityLockReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do.')
    .max(500, 'Lý do không được vượt quá 500 ký tự.')
})

export type EntityLockReasonValues = z.infer<typeof entityLockReasonSchema>
