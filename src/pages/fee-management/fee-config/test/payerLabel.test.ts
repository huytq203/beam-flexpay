import { describe, expect, it } from 'vitest'
import {
  getOutputPayerOptions,
  getPayerLabel,
  getPayerTypeOptions
} from '../constants/feeComponentParties'

describe('nhãn người chịu phí theo loại giao dịch', () => {
  it('rút tiền ví: giữ nhãn gốc, USER là Người chuyển', () => {
    expect(getPayerLabel('USER', 'EWALLET_WITHDRAWAL')).toBe('Người chuyển')
    expect(getPayerTypeOptions('EWALLET_WITHDRAWAL')).toContainEqual({
      value: 'USER',
      label: 'Người chuyển'
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

describe('người chịu phí đầu ra sửa được trên hộp thoại', () => {
  it('payer theo loại giao dịch đứng đầu làm mặc định, vẫn cho chọn bên còn lại', () => {
    expect(getOutputPayerOptions('EWALLET_DEPOSIT')).toEqual([
      { value: 'USER', label: 'Người chuyển' },
      { value: 'RECEIVER', label: 'Người nhận' }
    ])
  })

  it('rút tiền ví: cho chọn cả Người chuyển lẫn Người nhận', () => {
    expect(getOutputPayerOptions('EWALLET_WITHDRAWAL')).toEqual([
      { value: 'USER', label: 'Người chuyển' },
      { value: 'RECEIVER', label: 'Người nhận' }
    ])
  })

  it('tạm chưa cho chọn Merchant hay Hệ thống', () => {
    const values = getOutputPayerOptions('EWALLET_TRANSFER_INTERNAL').map(
      ({ value }) => value
    )
    expect(values).toEqual(['USER', 'RECEIVER'])
  })
})
