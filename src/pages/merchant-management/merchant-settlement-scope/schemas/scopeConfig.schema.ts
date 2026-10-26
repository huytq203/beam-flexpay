import { z } from 'zod'
import {
  AUTO_FREQUENCIES,
  SETTLEMENT_MODES
} from '../../merchant-settlement/schemas/settlementConfig.schema'
import { MIN_REASON_LENGTH } from '../constants/settlementScope.constants'

const tooShort = `Tối thiểu ${MIN_REASON_LENGTH} ký tự`

/** `isSystem`: mặc định hệ thống không có `HOLD`, `holdReason`, `active`. */
export const createScopeConfigSchema = (isSystem: boolean) =>
  z
    .object({
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
        .min(MIN_REASON_LENGTH, tooShort)
        .max(500, 'Tối đa 500 ký tự')
    })
    .superRefine((value, ctx) => {
      if (isSystem && value.settlementMode === 'HOLD')
        ctx.addIssue({
          code: 'custom',
          path: ['settlementMode'],
          message: 'Mặc định hệ thống không được đặt chế độ Tạm dừng'
        })
      if (
        !isSystem &&
        value.settlementMode === 'HOLD' &&
        value.holdReason.trim().length < MIN_REASON_LENGTH
      )
        ctx.addIssue({
          code: 'custom',
          path: ['holdReason'],
          message: `Lý do tạm dừng ${tooShort.toLowerCase()}`
        })
    })

export type ScopeConfigForm = z.infer<
  ReturnType<typeof createScopeConfigSchema>
>
