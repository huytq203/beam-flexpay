import { describe, expect, it } from 'vitest'
import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'
import {
  ALL_YEARS,
  formatMonthLabel,
  getCurrentVietnamMonth,
  getYearOptions,
  isCurrentMonth,
  isPastMonth,
  sortSpecialMonths,
  toMonthKey,
  toYearParam
} from '../utils/specialMonth.utils'

describe('getCurrentVietnamMonth', () => {
  it('cuối tháng UTC đã sang tháng sau theo giờ Việt Nam', () => {
    expect(getCurrentVietnamMonth(new Date('2026-09-30T17:00:00Z'))).toBe(
      '2026-10'
    )
    expect(getCurrentVietnamMonth(new Date('2026-09-30T16:59:59Z'))).toBe(
      '2026-09'
    )
  })

  it('qua năm theo giờ Việt Nam', () => {
    expect(getCurrentVietnamMonth(new Date('2026-12-31T18:00:00Z'))).toBe(
      '2027-01'
    )
  })
})

describe('so sánh tháng với tháng hiện tại', () => {
  const now = new Date('2026-10-09T03:00:00Z')

  it('tháng nhỏ hơn tháng hiện tại là tháng đã qua', () => {
    expect(isPastMonth('2026-09-01', now)).toBe(true)
    expect(isPastMonth('2025-12-01', now)).toBe(true)
  })

  it('tháng hiện tại và tương lai không phải tháng đã qua', () => {
    expect(isPastMonth('2026-10-01', now)).toBe(false)
    expect(isPastMonth('2027-02-01', now)).toBe(false)
  })

  it('nhận diện tháng hiện tại', () => {
    expect(isCurrentMonth('2026-10-01', now)).toBe(true)
    expect(isCurrentMonth('2026-11-01', now)).toBe(false)
  })

  it('tính theo giờ Việt Nam: 00:30 ngày 01/10 VN vẫn là tháng 10', () => {
    const edge = new Date('2026-09-30T17:30:00Z')
    expect(isPastMonth('2026-09-01', edge)).toBe(true)
    expect(isCurrentMonth('2026-10-01', edge)).toBe(true)
  })
})

describe('định dạng', () => {
  it('đổi monthStart sang MM/yyyy', () => {
    expect(formatMonthLabel('2027-02-01')).toBe('02/2027')
    expect(toMonthKey('2027-02-01')).toBe('2027-02')
  })
})

describe('tùy chọn năm và tham số', () => {
  it('gồm Tất cả năm và năm hiện tại -1..+3', () => {
    const options = getYearOptions(new Date('2026-10-09T03:00:00Z'))
    expect(options.map((option) => option.value)).toEqual([
      ALL_YEARS,
      '2025',
      '2026',
      '2027',
      '2028',
      '2029'
    ])
    expect(options[0].label).toBe('Tất cả năm')
  })

  it('Tất cả năm không gửi tham số year', () => {
    expect(toYearParam(ALL_YEARS)).toBeUndefined()
    expect(toYearParam('2027')).toEqual({ year: 2027 })
  })
})

describe('sortSpecialMonths', () => {
  const month = (monthStart: string): WalletLimitSpecialMonth => ({
    id: monthStart,
    monthStart,
    name: monthStart,
    createdAt: '2026-10-01T00:00:00Z',
    createdByUsername: null,
    updatedAt: null,
    updatedByUsername: null
  })

  it('sắp tăng dần theo monthStart và không đổi mảng gốc', () => {
    const input = [
      month('2027-02-01'),
      month('2026-10-01'),
      month('2026-12-01')
    ]
    expect(sortSpecialMonths(input).map((item) => item.monthStart)).toEqual([
      '2026-10-01',
      '2026-12-01',
      '2027-02-01'
    ])
    expect(input[0].monthStart).toBe('2027-02-01')
  })
})
