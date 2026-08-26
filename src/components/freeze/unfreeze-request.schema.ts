import { formatCurrency } from '@utils/formatNumber'
import { z } from 'zod'

/** 1 = mở toàn bộ phần lệnh đang đòi, 2 = admin tự nhập số tiền. */
export const UnfreezeAmountMode = { FULL: 1, PARTIAL: 2 } as const

export type UnfreezeAmountMode =
  (typeof UnfreezeAmountMode)[keyof typeof UnfreezeAmountMode]

export const toVnd = (value: number): string =>
  formatCurrency(value, { symbol: 'VNĐ', position: 'after' })

/** Trần phụ thuộc từng bản ghi nên schema phải dựng theo `maxAmount`, không hằng số hoá được. */
export const buildUnfreezeRequestSchema = (maxAmount: number) =>
  z.object({
    unfreezeType: z
      .literal(UnfreezeAmountMode.FULL)
      .or(z.literal(UnfreezeAmountMode.PARTIAL)),
    amount: z
      .number({ message: 'Số tiền mở băng không được để trống' })
      .int('Số tiền mở băng phải là số nguyên')
      .positive('Số tiền mở băng phải lớn hơn 0')
      .max(maxAmount, `Số tiền mở băng không được vượt quá ${toVnd(maxAmount)}`),
    reason: z
      .string()
      .trim()
      .min(1, 'Lý do mở băng không được để trống')
      .max(500, 'Lý do không được vượt quá 500 ký tự')
  })

export type UnfreezeRequestFormValues = z.infer<
  ReturnType<typeof buildUnfreezeRequestSchema>
>
