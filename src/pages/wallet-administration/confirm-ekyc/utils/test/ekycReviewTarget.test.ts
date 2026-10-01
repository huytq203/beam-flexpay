import { describe, expect, it } from 'vitest'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { getReviewSessionId } from '../ekycReviewTarget'

const record = (attempts: EKYCListItem['attempts']) =>
  ({ attempts }) as EKYCListItem

describe('getReviewSessionId', () => {
  it('chỉ chọn attempts[1] dù attempts[0] cũng đang chờ duyệt', () => {
    expect(
      getReviewSessionId(
        record([
          { sessionId: 'other', status: 'PENDING_REVIEW', createdAt: '' },
          { sessionId: 'target', status: 'PENDING_REVIEW', createdAt: '' }
        ])
      )
    ).toBe('target')
  })

  it('không chọn attempts[1] khi phiên chưa chờ duyệt', () => {
    expect(
      getReviewSessionId(
        record([
          { sessionId: 'other', status: 'PENDING_REVIEW', createdAt: '' },
          { sessionId: 'target', status: 'IN_PROGRESS', createdAt: '' }
        ])
      )
    ).toBeNull()
  })

  it('không có session để duyệt khi chưa có attempts[1]', () => {
    expect(
      getReviewSessionId(
        record([{ sessionId: 'only', status: 'PENDING_REVIEW', createdAt: '' }])
      )
    ).toBeNull()
  })
})
