import { z } from 'zod'

export const unfreezeTransactionSchema = z.object({
  freezeId: z.string().min(1, 'Vui lòng chọn khoản cần mở băng'),
  unfreezeType: z.literal(1).or(z.literal(2)),
  amount: z
    .number()
    .positive('Số tiền mở băng phải lớn hơn 0')
    .refine(Number.isInteger, 'Số tiền mở băng phải là số nguyên'),
  reason: z
    .string()
    .trim()
    .min(1, 'Lý do mở băng không được để trống')
    .max(500, 'Lý do không được vượt quá 500 ký tự')
})

export type UnfreezeTransactionFormValues = z.infer<
  typeof unfreezeTransactionSchema
>
