import { z } from 'zod'

export const SETTLEMENT_MODES = ['MANUAL_ONLY', 'AUTOMATIC', 'HOLD'] as const
export const AUTO_FREQUENCIES = [
  'DAILY',
  'EVERY_2_DAYS',
  'WEEKLY',
  'MONTHLY'
] as const

export const settlementConfigSchema = z
  .object({
    inherit: z.boolean(),
    settlementMode: z.enum(SETTLEMENT_MODES),
    autoFrequency: z.enum(AUTO_FREQUENCIES),
    holdbackDays: z
      .number({ error: 'Nhập số ngày' })
      .int('Phải là số nguyên')
      .min(0, 'Từ 0 đến 365 ngày')
      .max(365, 'Từ 0 đến 365 ngày'),
    holdReason: z.string(),
    active: z.boolean(),
    reason: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập lý do thay đổi')
      .max(500, 'Tối đa 500 ký tự')
  })
  .superRefine((value, ctx) => {
    if (
      !value.inherit &&
      value.settlementMode === 'HOLD' &&
      !value.holdReason.trim()
    )
      ctx.addIssue({
        code: 'custom',
        path: ['holdReason'],
        message: 'Tạm dừng quyết toán phải nhập lý do'
      })
  })

export type SettlementConfigForm = z.infer<typeof settlementConfigSchema>
