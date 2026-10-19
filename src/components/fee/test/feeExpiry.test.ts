import { describe, expect, it } from 'vitest'
import { isPolicyExpired } from '../feeExpiry'

describe('isPolicyExpired', () => {
  it('ACTIVE mà BE báo EXPIRED là hết hạn', () => {
    expect(
      isPolicyExpired({ status: 'ACTIVE', effectiveStatus: 'EXPIRED' })
    ).toBe(true)
  })

  it('INIT đã quá validTo là hết hạn dù chưa duyệt', () => {
    expect(isPolicyExpired({ status: 'INIT', validTo: '2020-01-01' })).toBe(
      true
    )
  })

  it.each([
    [{ status: 'ACTIVE', effectiveStatus: 'ACTIVE' }],
    [{ status: 'ACTIVE', effectiveStatus: 'PENDING' }],
    [{ status: 'INIT', validTo: '2999-01-01' }],
    [{ status: 'INIT', validTo: null }],
    [{ status: 'INACTIVE', validTo: '2020-01-01' }],
    [{ status: 'REJECTED', effectiveStatus: 'EXPIRED' }]
  ])('không hết hạn: %j', (input) => {
    expect(isPolicyExpired(input)).toBe(false)
  })
})
