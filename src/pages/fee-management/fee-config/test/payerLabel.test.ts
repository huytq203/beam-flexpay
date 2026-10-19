import { describe, expect, it } from 'vitest'
import {
  getPayerLabel,
  getPayerTypeOptions
} from '../constants/feeComponentParties'

describe('nhãn người chịu phí theo loại giao dịch', () => {
  it('rút tiền ví: giá trị USER/SENDER hiển thị là Người nhận', () => {
    expect(getPayerLabel('USER', 'EWALLET_WITHDRAWAL')).toBe('Người nhận')
    expect(getPayerLabel('SENDER', 'EWALLET_WITHDRAWAL')).toBe('Người nhận')
  })

  it('ô chọn của rút tiền giữ value USER nhưng nhãn là Người nhận', () => {
    expect(getPayerTypeOptions('EWALLET_WITHDRAWAL')).toContainEqual({
      value: 'USER',
      label: 'Người nhận'
    })
  })

  it('các loại giao dịch khác giữ nhãn cũ', () => {
    expect(getPayerLabel('USER', 'EWALLET_DEPOSIT')).toBe('Người chuyển')
    expect(getPayerLabel('USER', 'EWALLET_TRANSFER_INTERNAL')).toBe(
      'Người chuyển'
    )
    expect(getPayerLabel('RECEIVER', 'EWALLET_TRANSFER_INTERNAL')).toBe(
      'Người nhận'
    )
    expect(getPayerLabel('USER')).toBe('Người chuyển')
  })

  it('SYSTEM và giá trị lạ', () => {
    expect(getPayerLabel('SYSTEM', 'EWALLET_WITHDRAWAL')).toBe(
      'Hệ thống/platform'
    )
    expect(getPayerLabel('UNKNOWN_PAYER')).toBe('UNKNOWN_PAYER')
  })
})
