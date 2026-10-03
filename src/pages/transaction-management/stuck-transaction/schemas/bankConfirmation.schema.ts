import { z } from 'zod'
import { BANK_CONFIRMATION_CHANNEL_OPTIONS } from '../constants/bankConfirmation.constants'

export const bankConfirmationFieldsSchema = z.object({
  confirmationChannel: z.string().optional(),
  confirmationReference: z.string().optional(),
  confirmedAt: z.string().optional(),
  bankReference: z.string().optional(),
  valueDate: z
    .string()
    .transform((value) => value.replace(/T00:00:00\.000$/, ''))
    .optional(),
  bankBookedAt: z.string().optional()
})

export const validateBankConfirmation = (
  values: {
    newStatus: string
    includeBankConfirmation?: boolean
    bankConfirmation?: z.infer<typeof bankConfirmationFieldsSchema>
  },
  ctx: z.RefinementCtx,
  required = false
) => {
  if (!required && !values.includeBankConfirmation) return
  const bank = values.bankConfirmation
  const issue = (field: string, message: string) =>
    ctx.addIssue({ code: 'custom', path: ['bankConfirmation', field], message })
  const text = (
    field: 'confirmationChannel' | 'confirmationReference' | 'bankReference',
    max: number
  ) => {
    const value = bank?.[field]?.trim()
    if (!value || value.length > max)
      issue(field, `Vui lòng nhập từ 1 đến ${max} ký tự`)
  }
  if (
    !BANK_CONFIRMATION_CHANNEL_OPTIONS.some(
      ({ value }) => value === bank?.confirmationChannel
    )
  )
    issue('confirmationChannel', 'Vui lòng chọn kênh xác nhận')
  text('confirmationReference', 255)
  const confirmed = Date.parse(bank?.confirmedAt ?? '')
  if (!Number.isFinite(confirmed) || confirmed > Date.now())
    issue('confirmedAt', 'Nhập thời điểm xác nhận hợp lệ, không ở tương lai')
  if (values.newStatus !== 'POSTED') return
  text('bankReference', 255)
  if (!z.iso.date().safeParse(bank?.valueDate).success)
    issue('valueDate', 'Nhập ngày giá trị hợp lệ do ngân hàng cung cấp')
  const booked = Date.parse(bank?.bankBookedAt ?? '')
  if (!Number.isFinite(booked) || booked > confirmed)
    issue(
      'bankBookedAt',
      'Thời điểm ghi sổ phải hợp lệ và không sau thời điểm xác nhận'
    )
}
