import { describe, expect, it } from 'vitest'
import type { EKYCGroup } from '@type/apiResponseEKYC'
import { mapEKYCGroupToListItem } from '../useConfirmEKYC'

describe('mapEKYCGroupToListItem', () => {
  it('dùng attempts[0] để hiển thị bảng và giữ toàn bộ attempts cho detail', () => {
    const group: EKYCGroup = {
      groupKey: 'group-key',
      username: '0967770769',
      userId: 'user-id',
      attemptCount: 2,
      latestStatus: 'IN_PROGRESS',
      latestAt: '2026-08-24T14:21:36.214563',
      attempts: [
        {
          userId: 'user-id',
          username: '0967770769',
          sessionId: 'latest-session',
          status: 'IN_PROGRESS',
          currentStep: 'FACE_COMPARE',
          fullName: 'TRƯƠNG VIỆT HÙNG',
          faceMatchScore: 98.82,
          createdAt: '2026-08-24T14:21:36.214563'
        },
        {
          userId: 'user-id',
          username: '0967770769',
          sessionId: 'older-session',
          status: 'IN_PROGRESS',
          fullName: 'TRƯƠNG VIỆT HÙNG',
          faceMatchScore: 99.05,
          createdAt: '2026-08-24T09:27:44.942893'
        }
      ]
    }

    const result = mapEKYCGroupToListItem(group, 11)

    expect(result.sessionId).toBe('latest-session')
    expect(result.faceMatchScore).toBe(98.82)
    expect(result.key).toBe('group-key')
    expect(result.no).toBe(11)
    expect(result.attempts).toHaveLength(2)
  })
})
