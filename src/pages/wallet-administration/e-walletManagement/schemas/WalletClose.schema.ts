import { z } from 'zod'

/** Lý do bắt buộc, tối đa 500 ký tự, không có mức tối thiểu (quyết định 21/10). */
export const WalletCloseSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do xóa ví')
    .max(500, 'Lý do xóa ví không được vượt quá 500 ký tự')
})

export type WalletCloseFormValues = z.infer<typeof WalletCloseSchema>
