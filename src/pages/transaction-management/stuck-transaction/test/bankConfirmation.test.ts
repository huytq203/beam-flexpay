import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  bankConfirmationFieldsSchema,
  validateBankConfirmation
} from '../schemas/bankConfirmation.schema'

/** Khối này còn dùng cho hộp thoại Review (Duyệt / Từ chối), không còn ở form cập nhật treo. */
const schema = z
  .object({
    newStatus: z.string(),
    includeBankConfirmation: z.boolean().optional(),
    bankConfirmation: bankConfirmationFieldsSchema.optional()
  })
  .superRefine((values, ctx) => validateBankConfirmation(values, ctx, true))

const complete = {
  confirmationChannel: 'EMAIL',
  confirmationReference: 'REF-1',
  confirmedAt: '2026-01-02T10:00',
  bankReference: 'BANK-1',
  valueDate: '2026-01-02',
  bankBookedAt: '2026-01-02T09:00'
}

describe('validateBankConfirmation (dùng cho Review)', () => {
  it('thiếu bằng chứng khi bắt buộc thì lỗi', () => {
    expect(schema.safeParse({ newStatus: 'POSTED' }).success).toBe(false)
  })

  it('đủ bằng chứng thì hợp lệ', () => {
    expect(
      schema.safeParse({ newStatus: 'POSTED', bankConfirmation: complete })
        .success
    ).toBe(true)
  })

  it.each([
    { confirmedAt: '2999-01-01T10:00' },
    { bankBookedAt: '2026-01-03T10:00' },
    { bankReference: '' },
    { valueDate: '2026-02-30' }
  ])('từ chối khi POSTED mà %o', (override) => {
    expect(
      schema.safeParse({
        newStatus: 'POSTED',
        bankConfirmation: { ...complete, ...override }
      }).success
    ).toBe(false)
  })

  it('FAILED không đòi mã ngân hàng, ngày giá trị, giờ ghi sổ', () => {
    expect(
      schema.safeParse({
        newStatus: 'FAILED',
        bankConfirmation: {
          ...complete,
          bankReference: '',
          valueDate: '',
          bankBookedAt: ''
        }
      }).success
    ).toBe(true)
  })
})
