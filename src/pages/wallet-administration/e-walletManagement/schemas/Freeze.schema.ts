import { z } from 'zod'

export const FreezeSchema = z.object({
    freezeType: z.literal(1).or(z.literal(2)),
    amount: z.number().optional(),
    reason: z
        .string()
        .min(10, 'Lý do đóng trên 10 ký tự')
        .max(500, 'Lý do không được vượt quá 500 ký tự'),
    expiryTime: z.string().optional(),
})

export type FreezeFormValues = z.infer<typeof FreezeSchema>

export const UnfreezeSchema = z.object({
    reason: z
        .string()
        .min(10, 'Lý do mở băng trên 10 ký tự')
        .max(500, 'Lý do không được vượt quá 500 ký tự'),
})

export type UnfreezeFormValues = z.infer<typeof UnfreezeSchema>

export const LockSchema = z.object({
    reason: z
        .string()
        .min(1, 'Lý do khóa không được để trống')
        .max(500, 'Lý do không được vượt quá 500 ký tự'),
})

export type LockFormValues = z.infer<typeof LockSchema>

export const UnlockSchema = z.object({
    reason: z
        .string()
        .min(1, 'Lý do mở khóa không được để trống')
        .max(500, 'Lý do không được vượt quá 500 ký tự'),
})

export type UnlockFormValues = z.infer<typeof UnlockSchema>
