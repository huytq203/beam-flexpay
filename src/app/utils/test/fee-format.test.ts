import { describe, expect, it } from 'vitest'
import {
  formatFeeComponentAmount,
  formatFeeLimit,
  formatFeeNumber,
  formatTierRange
} from '../fee-format'

describe('định dạng số tiền phí', () => {
  it('giữ nguyên đủ chữ số, không rút gọn', () => {
    expect(formatFeeNumber(1234567)).toBe('1.234.567')
  })

  it('coi min/max bằng 0 hoặc thiếu là không giới hạn', () => {
    expect(formatFeeLimit(0)).toBe('—')
    expect(formatFeeLimit(null)).toBe('—')
    expect(formatFeeLimit(undefined)).toBe('—')
    expect(formatFeeLimit(50000)).toBe('50.000 đ')
  })

  it('mô tả bậc phí không giới hạn trên', () => {
    expect(formatTierRange(5000000, null)).toBe('5.000.000 trở lên')
    expect(formatTierRange(null, null)).toBe('Không chia bậc')
  })
})

describe('mức phí của một thành phần', () => {
  it('hiện số tiền cố định', () => {
    expect(
      formatFeeComponentAmount({ calculationMethod: 'DIRECT', fixedAmount: 2000 })
    ).toBe('2.000 đ')
  })

  it('hiện phần trăm', () => {
    expect(
      formatFeeComponentAmount({ calculationMethod: 'DIRECT', percentage: 0.3 })
    ).toBe('0,3%')
  })

  it('cộng dồn khi có cả tiền cố định lẫn phần trăm', () => {
    expect(
      formatFeeComponentAmount({
        calculationMethod: 'DIRECT',
        fixedAmount: 2000,
        percentage: 0.3
      })
    ).toBe('2.000 đ + 0,3%')
  })

  it('đếm số bậc thay vì bịa ra một con số cố định', () => {
    expect(
      formatFeeComponentAmount({
        calculationMethod: 'FLAT_TIER',
        tiers: [{}, {}, {}]
      })
    ).toBe('3 bậc')
  })

  it('nói rõ là tính theo bậc khi chưa tải được danh sách bậc', () => {
    expect(
      formatFeeComponentAmount({ calculationMethod: 'PROGRESSIVE_TIER' })
    ).toBe('Theo bậc')
  })

  it('trả gạch ngang khi không có dữ liệu mức phí', () => {
    expect(formatFeeComponentAmount({ calculationMethod: 'DIRECT' })).toBe('—')
  })
})
