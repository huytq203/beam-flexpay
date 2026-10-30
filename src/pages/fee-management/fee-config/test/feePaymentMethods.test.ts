import { describe, expect, it } from 'vitest'
import {
  getPaymentMethodOptions,
  isPaymentMethodAllowed
} from '../constants/feeConfigFields'

const valuesFor = (serviceType: string) =>
  getPaymentMethodOptions(serviceType).map((option) => option.value)

describe('phương thức giao dịch theo loại giao dịch', () => {
  it.each([
    ['EWALLET_DEPOSIT', ['ATM', 'LINKED_ACCOUNT']],
    ['EWALLET_WITHDRAWAL', ['ATM', 'LINKED_ACCOUNT']],
    ['EWALLET_TRANSFER_INTERNAL', ['WALLET_BALANCE']],
    ['EWALLET_TRANSFER_EXTERNAL', ['BANK_TRANSFER']],
    [
      'EWALLET_CASHBACK',
      ['WALLET_BALANCE', 'ATM', 'LINKED_ACCOUNT', 'BANK_TRANSFER', 'CC']
    ],
    ['MERCHANT_VA_BILL_COLLECTION', ['VA']],
    ['PAYOUT_BANK_TRANSFER', ['BANK_TRANSFER']],
    ['MERCHANT_DISBURSEMENT', ['BANK_TRANSFER']]
  ])('%s trả đúng tập phương thức', (serviceType, expected) => {
    expect(valuesFor(serviceType)).toEqual(expected)
  })

  it('chưa có phương thức khi chưa chọn loại giao dịch', () => {
    expect(valuesFor('')).toEqual([])
  })

  it('không có mục "Tất cả"; để trống ô là áp dụng cho mọi phương thức', () => {
    for (const serviceType of ['EWALLET_DEPOSIT', 'MERCHANT_VA_BILL_COLLECTION']) {
      expect(valuesFor(serviceType)).not.toContain('')
      expect(isPaymentMethodAllowed(serviceType, '')).toBe(true)
    }
    expect(isPaymentMethodAllowed('EWALLET_DEPOSIT', 'VA')).toBe(false)
  })

  it('không hiển thị mã chưa được backend phí hỗ trợ', () => {
    const allValues = Object.values([
      'EWALLET_DEPOSIT',
      'EWALLET_WITHDRAWAL',
      'EWALLET_TRANSFER_INTERNAL',
      'EWALLET_TRANSFER_EXTERNAL',
      'EWALLET_CASHBACK',
      'MERCHANT_VA_BILL_COLLECTION',
      'PAYOUT_BANK_TRANSFER',
      'MERCHANT_DISBURSEMENT'
    ]).flatMap(valuesFor)

    expect(allValues).not.toContain('QR')
    expect(allValues).not.toContain('QR_CODE')
    expect(allValues).not.toContain('VISA')
    expect(allValues).not.toContain('MASTER')
    expect(allValues).not.toContain('JCB')
    expect(allValues).not.toContain('AMEX')
  })
})
