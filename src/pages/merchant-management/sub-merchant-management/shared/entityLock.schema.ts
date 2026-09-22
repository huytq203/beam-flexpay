import { z } from 'zod'

export const entityLockReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Lý do cần có ít nhất 10 ký tự.')
    .max(500, 'Lý do không được vượt quá 500 ký tự.')
})

export type EntityLockReasonValues = z.infer<typeof entityLockReasonSchema>
