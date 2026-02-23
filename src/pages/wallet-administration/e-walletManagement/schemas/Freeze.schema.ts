import { z } from 'zod'

export const FreezeSchema = z.object({
    freezeType: z.literal(1).or(z.literal(2)),
    amount: z.number().optional(),
    reason: z
        .string()
        .min(1, 'Lý do đóng băng không được để trống')
        .max(500, 'Lý do không được vượt quá 500 ký tự'),
    expiryTime: z.string().optional(),
})

export type FreezeFormValues = z.infer<typeof FreezeSchema>

export const UnfreezeSchema = z.object({
    reason: z
        .string()
        .min(1, 'Lý do mở băng không được để trống')
        .max(500, 'Lý do không được vượt quá 500 ký tự'),
})

export type UnfreezeFormValues = z.infer<typeof UnfreezeSchema>
