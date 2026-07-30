import { describe, expect, it } from 'vitest'
import { calculateServerOffset } from '../hooks/useVietnamTime'

describe('calculateServerOffset', () => {
  it('tính offset theo trung điểm request khi giờ server hợp lệ', () => {
    const requestStartedAt = Date.parse('2026-07-28T07:44:30.000Z')
    const responseReceivedAt = requestStartedAt + 200

    expect(
      calculateServerOffset(
        'Tue, 28 Jul 2026 07:44:30 GMT',
        requestStartedAt,
        responseReceivedAt
      )
    ).toBe(-100)
  })

  it('từ chối nguồn server chậm 15 phút', () => {
    const requestStartedAt = Date.parse('2026-07-28T07:45:00.000Z')

    expect(
      calculateServerOffset(
        'Tue, 28 Jul 2026 07:30:00 GMT',
        requestStartedAt,
        requestStartedAt + 100
      )
    ).toBeNull()
  })

  it('từ chối header thiếu hoặc sai định dạng', () => {
    expect(calculateServerOffset(null, 1_000, 1_100)).toBeNull()
    expect(calculateServerOffset('not-a-date', 1_000, 1_100)).toBeNull()
  })
})
