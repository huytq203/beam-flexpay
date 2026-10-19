import { describe, expect, it } from 'vitest'
import type { ContentEKYC } from '@type/apiResponseEKYC'
import { findAppliedAttempt, isStalledAttempt } from '../ekycAttempt'

const NOW = Date.parse('2026-10-19T15:30:00Z')

const attempt = (overrides: Partial<ContentEKYC>): ContentEKYC => ({
  status: 'IN_PROGRESS',
  createdAt: '2026-10-19T11:00:00Z',
  ...overrides
})

describe('findAppliedAttempt', () => {
  it('chọn phiên thành công mới nhất, bỏ qua phiên đang chạy mới hơn', () => {
    const applied = attempt({
      sessionId: 'b',
      status: 'COMPLETED',
      createdAt: '2026-10-19T12:00:00Z'
    })
    const attempts = [
      attempt({ sessionId: 'c', createdAt: '2026-10-19T13:00:00Z' }),
      applied,
      attempt({
        sessionId: 'a',
        status: 'VERIFIED',
        createdAt: '2026-10-19T10:00:00Z'
      })
    ]
    expect(findAppliedAttempt(attempts)).toBe(applied)
  })

  it('không có phiên thành công thì không có phiên được áp dụng', () => {
    expect(findAppliedAttempt([attempt({ status: 'FAILED' })])).toBeUndefined()
  })
})

describe('isStalledAttempt', () => {
  it('phiên đang chạy đã quá hạn là phiên dừng', () => {
    expect(
      isStalledAttempt(attempt({ expiresAt: '2026-10-19T11:51:23Z' }), NOW)
    ).toBe(true)
  })

  it('phiên đang chạy còn hạn hoặc không có hạn chưa dừng', () => {
    expect(
      isStalledAttempt(attempt({ expiresAt: '2026-10-19T15:50:59Z' }), NOW)
    ).toBe(false)
    expect(isStalledAttempt(attempt({ expiresAt: null }), NOW)).toBe(false)
  })

  it('phiên đã kết thúc không bị coi là dừng dù quá hạn', () => {
    expect(
      isStalledAttempt(
        attempt({ status: 'COMPLETED', expiresAt: '2026-10-19T11:51:23Z' }),
        NOW
      )
    ).toBe(false)
  })
})
