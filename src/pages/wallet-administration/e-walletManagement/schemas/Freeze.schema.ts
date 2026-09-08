import { z } from 'zod'

export const FreezeSchema = z.object({
    freezeType: z.literal(1).or(z.literal(2)),
    // Lệnh đóng băng luôn phải có số tiền: trước đây field này optional nên form
    // gửi được `amount: undefined` xuống wallet-core.
    amount: z
        .number('Vui lòng nhập số tiền cần đóng băng')
        .positive('Số tiền đóng băng phải lớn hơn 0')
        .refine(Number.isInteger, 'Số tiền đóng băng phải là số nguyên'),
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
