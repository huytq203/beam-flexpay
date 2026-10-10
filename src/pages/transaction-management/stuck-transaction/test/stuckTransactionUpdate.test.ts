import { describe, expect, it } from 'vitest'
import { stuckTransactionUpdateSchema } from '@/components/transaction/StuckTransaction.schema'
import { toStuckTransactionUpdate } from '../dto/stuckTransactionUpdate.dto'

const NOTE = 'Đã đối chiếu ngân hàng'
const ALL = [
  'authCode',
  'settlementId',
  'bankReference',
  'receiptKey',
  'refund',
  'refundAuthCode',
  'refundSettlementId',
  'refundBankReference'
]
const parse = (over: object) =>
  stuckTransactionUpdateSchema.parse({
    newStatus: 'POSTED',
    note: NOTE,
    ...over
  })

describe('schema cập nhật giao dịch treo', () => {
  it('chỉ note bắt buộc', () => {
    expect(
      stuckTransactionUpdateSchema.safeParse({
        newStatus: 'POSTED',
        note: NOTE
      }).success
    ).toBe(true)
    expect(
      stuckTransactionUpdateSchema.safeParse({ newStatus: 'POSTED' }).success
    ).toBe(false)
  })

  it.each([
    ['9 ký tự', 'a'.repeat(9), false],
    ['10 ký tự', 'a'.repeat(10), true],
    ['500 ký tự', 'a'.repeat(500), true],
    ['501 ký tự', 'a'.repeat(501), false]
  ])('note %s', (_name, note, ok) => {
    expect(
      stuckTransactionUpdateSchema.safeParse({ newStatus: 'FAILED', note })
        .success
    ).toBe(ok)
  })

  it('refund không bắt buộc mã hoàn; mọi mã tối đa 50 ký tự', () => {
    expect(
      stuckTransactionUpdateSchema.safeParse({
        newStatus: 'FAILED',
        note: NOTE,
        refund: true
      }).success
    ).toBe(true)
    for (const field of [
      'authCode',
      'settlementId',
      'bankReference',
      'refundAuthCode',
      'refundSettlementId',
      'refundBankReference'
    ]) {
      expect(
        stuckTransactionUpdateSchema.safeParse({
          newStatus: 'FAILED',
          note: NOTE,
          [field]: 'A'.repeat(51)
        }).success
      ).toBe(false)
    }
  })
})

describe('toStuckTransactionUpdate', () => {
  const receipt = { receiptKey: 'k1', fileName: 'a.png', sizeBytes: 1 }

  it('POSTED gửi mã đối soát + receiptKey, cắt khoảng trắng và không có bankConfirmation', () => {
    const values = parse({
      authCode: ' A1 ',
      settlementId: 'S1',
      bankReference: 'B1',
      receipt
    })
    const payload = toStuckTransactionUpdate('TX-1', values, ALL)
    expect(payload).toEqual({
      transactionCode: 'TX-1',
      newStatus: 'POSTED',
      note: NOTE,
      authCode: 'A1',
      settlementId: 'S1',
      bankReference: 'B1',
      receiptKey: 'k1'
    })
    expect(payload).not.toHaveProperty('bankConfirmation')
  })

  it('chỉ gửi trường nằm trong optionalFields của action', () => {
    const values = parse({ authCode: 'A1', bankReference: 'B1', receipt })
    expect(
      toStuckTransactionUpdate('TX-1', values, ['authCode', 'settlementId'])
    ).toEqual({
      transactionCode: 'TX-1',
      newStatus: 'POSTED',
      note: NOTE,
      authCode: 'A1'
    })
  })

  it('FAILED không gửi mã đối soát, bankReference, receiptKey', () => {
    const values = parse({
      newStatus: 'FAILED',
      authCode: 'A1',
      bankReference: 'B1',
      receipt
    })
    expect(toStuckTransactionUpdate('TX-1', values, ALL)).toEqual({
      transactionCode: 'TX-1',
      newStatus: 'FAILED',
      note: NOTE
    })
  })

  it('FAILED + refund gửi mã hoàn; refund bị bỏ nếu action không cho phép', () => {
    const values = parse({
      newStatus: 'FAILED',
      refund: true,
      refundAuthCode: 'RA',
      refundBankReference: 'RB'
    })
    expect(toStuckTransactionUpdate('TX-1', values, ALL)).toEqual({
      transactionCode: 'TX-1',
      newStatus: 'FAILED',
      note: NOTE,
      refund: true,
      refundAuthCode: 'RA',
      refundBankReference: 'RB'
    })
    expect(toStuckTransactionUpdate('TX-1', values, [])).toEqual({
      transactionCode: 'TX-1',
      newStatus: 'FAILED',
      note: NOTE
    })
  })
})
