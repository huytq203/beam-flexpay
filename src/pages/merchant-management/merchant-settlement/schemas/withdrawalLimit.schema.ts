import { z } from 'zod'

const money = z
  .number({ error: 'Nhập số tiền' })
  .int('Phải là số nguyên')
  .min(0, 'Không được âm')
  .optional()

export const withdrawalLimitSchema = z
  .object({
    targetLevel: z.enum(['SYSTEM', 'MASTER', 'SUB']),
    targetId: z.string(),
    minimumWithdrawalAmount: money,
    maximumWithdrawalAmount: money,
    dailyWithdrawalLimit: money,
    autoApprovalThreshold: money,
    maximumDailyWithdrawalCount: z
      .number({ error: 'Nhập số lệnh' })
      .int('Phải là số nguyên')
      .positive('Phải lớn hơn 0 hoặc để trống')
      .optional(),
    activeFrom: z.string().min(1, 'Chọn thời điểm có hiệu lực'),
    reason: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập lý do')
      .max(1000, 'Tối đa 1000 ký tự')
  })
  .superRefine((value, ctx) => {
    if (value.targetLevel !== 'SYSTEM' && !value.targetId.trim())
      ctx.addIssue({
        code: 'custom',
        path: ['targetId'],
        message: 'Chọn đối tượng áp dụng'
      })
    const { minimumWithdrawalAmount: min, maximumWithdrawalAmount: max } = value
    if (min !== undefined && max !== undefined && min > max)
      ctx.addIssue({
        code: 'custom',
        path: ['minimumWithdrawalAmount'],
        message: 'Mức tối thiểu không được vượt mức tối đa'
      })
    const hasLimit = [
      min,
      max,
      value.dailyWithdrawalLimit,
      value.autoApprovalThreshold,
      value.maximumDailyWithdrawalCount
    ].some((item) => item !== undefined)
    if (!hasLimit)
      ctx.addIssue({
        code: 'custom',
        path: ['dailyWithdrawalLimit'],
        message: 'Nhập ít nhất một hạn mức'
      })
  })

export type WithdrawalLimitForm = z.infer<typeof withdrawalLimitSchema>
