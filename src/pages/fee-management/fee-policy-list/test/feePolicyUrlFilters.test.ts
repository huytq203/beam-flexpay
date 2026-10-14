import { describe, expect, it } from 'vitest'
import {
  dateOnly,
  FILTER_KEYS,
  isFeeScope,
  keepFilters
} from '../utils/feePolicyUrlFilters'

describe('keepFilters', () => {
  it('giữ nguyên bộ lọc đang có và đặt null cho khoá thiếu', () => {
    const result = keepFilters({ keyword: 'abc', payerType: 'RECEIVER' })

    expect(result.keyword).toBe('abc')
    expect(result.payerType).toBe('RECEIVER')
    expect(result.beneficiaryType).toBeNull()
    expect(Object.keys(result).sort()).toEqual([...FILTER_KEYS].sort())
  })

  it('ghi đè bằng overrides, null hoặc undefined là xoá khỏi URL', () => {
    const result = keepFilters(
      {
        keyword: 'abc',
        feeBearer: 'BOTH',
        serviceType: 'EWALLET_TRANSFER_INTERNAL'
      },
      { feeBearer: null, keyword: 'xyz', bankCode: undefined, direction: null }
    )

    expect(result.keyword).toBe('xyz')
    expect(result.feeBearer).toBeNull()
    expect(result.bankCode).toBeNull()
    expect(result.serviceType).toBe('EWALLET_TRANSFER_INTERNAL')
  })

  it('có các khoá lọc người chịu, người hưởng và bên chịu phí', () => {
    expect(FILTER_KEYS).toEqual(
      expect.arrayContaining(['payerType', 'beneficiaryType', 'feeBearer'])
    )
  })
})

describe('dateOnly và isFeeScope', () => {
  it('cắt ngày và nhận diện luồng phí hợp lệ', () => {
    expect(dateOnly('2026-10-13T08:00:00.000')).toBe('2026-10-13')
    expect(dateOnly(undefined)).toBeNull()
    expect(isFeeScope('OUTPUT_FEE')).toBe(true)
    expect(isFeeScope('KHÁC')).toBe(false)
  })
})
