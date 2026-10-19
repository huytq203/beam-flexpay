import { z } from 'zod'

export const REFUND_REASON_MAX = 500
const REASON_RANGE = `Lý do hoàn tiền tối đa ${REFUND_REASON_MAX} ký tự`

/**
 * Chỉ những gì người vận hành nhập. Kênh, loại giao dịch gốc, nguồn tạo và
 * thông tin thụ hưởng do UI/BE quyết định nên không nằm trong form.
 */
export const createRefundFormSchema = z.object({
  requestedAmount: z
    .number({ error: 'Số tiền hoàn là bắt buộc' })
    .int('Số tiền hoàn phải là số nguyên')
    .positive('Số tiền hoàn phải lớn hơn 0'),
  reason: z
    .string()
    .trim()
    .min(1, 'Lý do hoàn tiền là bắt buộc')
    .max(REFUND_REASON_MAX, REASON_RANGE),
  sendNotification: z.boolean()
})

export type CreateRefundFormValues = z.infer<typeof createRefundFormSchema>
