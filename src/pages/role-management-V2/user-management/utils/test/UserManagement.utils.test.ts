import { describe, expect, it } from 'vitest'
import { toUserQueryFilters } from '../UserManagement.utils'

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
