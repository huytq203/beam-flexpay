import { describe, expect, it } from 'vitest'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { getReviewSessionId } from '../ekycReviewTarget'

const record = (attempts: EKYCListItem['attempts']) =>
  ({ attempts }) as EKYCListItem

describe('getReviewSessionId', () => {
  it('chọn phiên chờ duyệt dù không nằm ở attempts[1]', () => {
    expect(
      getReviewSessionId(
        record([
          { sessionId: 'a', status: 'IN_PROGRESS', createdAt: '2026-10-07T10' },
          { sessionId: 'b', status: 'IN_PROGRESS', createdAt: '2026-10-07T09' },
          {
            sessionId: 'c',
            status: 'PENDING_REVIEW',
            createdAt: '2026-10-07T08'
          }
        ])
      )
    ).toBe('c')
  })

  it('chọn phiên chờ duyệt mới nhất khi có nhiều phiên', () => {
    expect(
      getReviewSessionId(
        record([
          {
            sessionId: 'old',
            status: 'PENDING_REVIEW',
            createdAt: '2026-10-07T08'
          },
          {
            sessionId: 'new',
            status: 'PENDING_REVIEW',
            createdAt: '2026-10-07T09'
          }
        ])
      )
    ).toBe('new')
  })

  it('trả null khi không có phiên nào chờ duyệt', () => {
    expect(
      getReviewSessionId(
        record([
          { sessionId: 'x', status: 'IN_PROGRESS', createdAt: '2026-10-07T10' }
        ])
      )
    ).toBeNull()
  })
})
