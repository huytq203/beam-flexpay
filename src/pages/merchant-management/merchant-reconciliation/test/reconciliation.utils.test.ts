import { describe, expect, it } from 'vitest'
import {
  formatEquationValue,
  formatSignedDifference,
  isLedgerUnavailable,
  isNoteValid,
  withOtpConsumedNotice
} from '../utils/reconciliation.utils'

describe('reconciliation.utils', () => {
  it('ghi chú tính độ dài sau trim, tối thiểu 10 ký tự', () => {
    expect(isNoteValid('   123456789   ')).toBe(false)
    expect(isNoteValid('  1234567890  ')).toBe(true)
  })

  it('phương trình 1-6 là đồng, 7-9 là số vi phạm', () => {
    expect(formatEquationValue({ no: 1 }, 5200000)).toBe('5.200.000 đ')
    expect(formatEquationValue({ no: 7 }, 3)).toBe('3')
    expect(formatSignedDifference({ no: 1 }, -200000)).toBe('-200.000 đ')
    expect(formatSignedDifference({ no: 8 }, 0)).toBe('0')
  })

  it('503 hoặc mã MERCHANT_ESCROW_BALANCE_UNAVAILABLE là sổ cái chưa đọc được', () => {
    expect(isLedgerUnavailable({ status: 503 })).toBe(true)
    expect(
      isLedgerUnavailable({
        status: 400,
        data: { message: 'MERCHANT_ESCROW_BALANCE_UNAVAILABLE' }
      })
    ).toBe(true)
    expect(isLedgerUnavailable({ status: 404, data: {} })).toBe(false)
  })

  it('lỗi sau khi tiêu OTP giữ nguyên message và nối lời nhắc xin mã mới', () => {
    const next = withOtpConsumedNotice({
      status: 409,
      data: { message: 'MERCHANT_RECONCILIATION_STILL_OFF', detail: '(1) lệch' }
    }) as { data: { message: string; detail: string } }
    expect(next.data.message).toBe('MERCHANT_RECONCILIATION_STILL_OFF')
    expect(next.data.detail).toMatch(/^\(1\) lệch .*xin mã OTP mới/)
  })
})
