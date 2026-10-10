import { z } from 'zod'

export const REASON_MIN = 5
export const REASON_MAX = 500
const REASON_RANGE_MESSAGE = `Lý do phải có từ ${REASON_MIN} đến ${REASON_MAX} ký tự`

const reasonField = (emptyMessage: string, rangeMessage: string) =>
  z
    .string()
    .trim()
    .min(1, emptyMessage)
    .min(REASON_MIN, rangeMessage)
    .max(REASON_MAX, rangeMessage)

export const rejectRefundSchema = z.object({
  reason: reasonField(
    'Vui lòng nhập lý do',
    `Lý do từ chối phải có từ ${REASON_MIN} đến ${REASON_MAX} ký tự`
  )
})
export type RejectRefundValues = z.infer<typeof rejectRefundSchema>

export const settleRefundSchema = z
  .object({
    result: z.enum(['SUCCESS', 'FAILED']),
    failureReason: z.string().trim().max(REASON_MAX, REASON_RANGE_MESSAGE)
  })
  .superRefine((values, ctx) => {
    if (values.result === 'SUCCESS') return
    if (values.failureReason.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['failureReason'],
        message: 'Nhập lý do thất bại'
      })
    } else if (values.failureReason.length < REASON_MIN) {
      ctx.addIssue({
        code: 'custom',
        path: ['failureReason'],
        message: REASON_RANGE_MESSAGE
      })
    }
  })
export type SettleRefundValues = z.infer<typeof settleRefundSchema>

const datePart = (value: string): string => value.slice(0, 10)

export const refundFilterSchema = z
  .object({
    keyword: z.string().trim().max(100, 'Từ khóa tối đa 100 ký tự'),
    channel: z.string(),
    createdSource: z.string(),
    createdFrom: z.string(),
    createdTo: z.string()
  })
  .superRefine((values, ctx) => {
    if (!values.createdFrom || !values.createdTo) return
    if (datePart(values.createdFrom) <= datePart(values.createdTo)) return
    ctx.addIssue({
      code: 'custom',
      path: ['createdTo'],
      message: 'Ngày kết thúc phải sau hoặc cùng ngày bắt đầu'
    })
  })
export type RefundFilterValues = z.infer<typeof refundFilterSchema>
