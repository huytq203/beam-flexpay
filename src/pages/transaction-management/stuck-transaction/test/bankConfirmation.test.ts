import { describe, expect, it } from 'vitest'
import { toStuckTransactionUpdate } from '../dto/bankConfirmation.dto'
import { createStuckTransactionUpdateSchema } from '@/components/transaction/StuckTransaction.schema'
import { stuckTransactionUpdateSchema } from '@/components/transaction/StuckTransaction.schema'

const values = {
  newStatus: 'POSTED',
  note: 'Đã đối chiếu ngân hàng',
  includeBankConfirmation: true,
  bankConfirmation: {
    confirmationChannel: 'EMAIL',
    confirmationReference: 'REF-1',
    confirmedAt: '2026-01-02T10:00',
    bankReference: 'BANK-1',
    valueDate: '2026-01-02',
    bankBookedAt: '2026-01-02T09:00'
  }
}

describe('bank confirmation validation', () => {
  it('rejects missing confirmation details when enabled', () => {
    expect(
      stuckTransactionUpdateSchema.safeParse({
        ...values,
        bankConfirmation: undefined
      }).success
    ).toBe(false)
  })
  it('accepts complete evidence', () => {
    expect(stuckTransactionUpdateSchema.safeParse(values).success).toBe(true)
  })
  it('rejects future confirmation and booking after confirmation', () => {
    for (const override of [
      { confirmedAt: '2999-01-01T10:00' },
      { bankBookedAt: '2026-01-03T10:00' }
    ]) {
      expect(
        stuckTransactionUpdateSchema.safeParse({
          ...values,
          bankConfirmation: { ...values.bankConfirmation, ...override }
        }).success
      ).toBe(false)
    }
  })
  it('requires bank reference and real value date for success', () => {
    for (const override of [
      { bankReference: '' },
      { valueDate: '2026-02-30' },
      { bankBookedAt: '' }
    ]) {
      expect(
        stuckTransactionUpdateSchema.safeParse({
          ...values,
          bankConfirmation: { ...values.bankConfirmation, ...override }
        }).success
      ).toBe(false)
    }
  })
  it('accepts failure without settlement fields and ignores disabled evidence', () => {
    expect(
      stuckTransactionUpdateSchema.safeParse({
        ...values,
        newStatus: 'FAILED',
        bankConfirmation: {
          ...values.bankConfirmation,
          bankReference: '',
          valueDate: '',
          bankBookedAt: ''
        }
      }).success
    ).toBe(true)
    expect(
      stuckTransactionUpdateSchema.safeParse({
        ...values,
        includeBankConfirmation: false,
        bankConfirmation: undefined
      }).success
    ).toBe(true)
  })
})

describe('bank confirmation payload', () => {
  it('requires evidence after 4101 even if the checkbox is off', () => {
    expect(
      createStuckTransactionUpdateSchema(true).safeParse({
        ...values,
        includeBankConfirmation: false,
        bankConfirmation: undefined
      }).success
    ).toBe(false)
  })
  it('derives FAILED outcome and omits stale success fields', () => {
    const parsed = stuckTransactionUpdateSchema.parse({
      ...values,
      newStatus: 'FAILED',
      authCode: 'OLD',
      settlementId: 'OLD'
    })
    expect(toStuckTransactionUpdate('TX-1', parsed, false, true)).toEqual({
      transactionCode: 'TX-1',
      newStatus: 'FAILED',
      note: values.note,
      bankConfirmation: {
        outcome: 'FAILED',
        confirmationChannel: 'EMAIL',
        confirmationReference: 'REF-1',
        confirmedAt: new Date(values.bankConfirmation.confirmedAt).toISOString()
      }
    })
  })
  it('omits evidence for internal transfers or an unchecked section', () => {
    const parsed = stuckTransactionUpdateSchema.parse(values)
    expect(
      toStuckTransactionUpdate('TX-1', parsed, false, false)
    ).not.toHaveProperty('bankConfirmation')
    expect(
      toStuckTransactionUpdate(
        'TX-1',
        { ...parsed, includeBankConfirmation: false },
        false,
        true
      )
    ).not.toHaveProperty('bankConfirmation')
  })
})
