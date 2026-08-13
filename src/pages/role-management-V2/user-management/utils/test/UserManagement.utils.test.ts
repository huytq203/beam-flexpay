import { describe, expect, it } from 'vitest'
import {
  formatUserTimestamp,
  toUserQueryFilters
} from '../UserManagement.utils'

describe('toUserQueryFilters', () => {
  it('bỏ hết param khi form còn mặc định', () => {
    expect(
      toUserQueryFilters({
        keyword: '   ',
        emailVerified: undefined,
        status: undefined
      })
    ).toEqual({})
  })

  it('trim keyword và đổi chuỗi lọc thành boolean cho BE', () => {
    expect(
      toUserQueryFilters({
        keyword: '  nguyen  ',
        emailVerified: 'false',
        status: 'true'
      })
    ).toEqual({ keyword: 'nguyen', emailVerified: false, status: true })
  })
})

describe('formatUserTimestamp', () => {
  it('định dạng được cả epoch từ Keycloak và ISO audit attribute', () => {
    expect(formatUserTimestamp(0)).not.toBe('--')
    expect(formatUserTimestamp('2026-08-10T09:15:30')).toBe(
      '10/08/2026 09:15:30'
    )
  })

  it('trả placeholder cho dữ liệu trống hoặc sai định dạng', () => {
    expect(formatUserTimestamp(null)).toBe('--')
    expect(formatUserTimestamp('not-a-date')).toBe('--')
  })
})
