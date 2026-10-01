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
      email: 'hung@example.com',
      occupation: 'Kỹ sư',
      position: 'Trưởng phòng',
      currentAddress: 'Cầu Giấy, Hà Nội',
      attempts: [
        {
          userId: 'user-id',
          username: '0967770769',
          sessionId: 'latest-session',
          status: 'IN_PROGRESS',
          documentProfileStatus: 'VERIFIED',
          documentOwnedByOtherAccount: true,
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
    expect(result.email).toBe('hung@example.com')
    expect(result.occupation).toBe('Kỹ sư')
    expect(result.position).toBe('Trưởng phòng')
    expect(result.status).toBe('IN_PROGRESS')
    expect(result.profileStatus).toBeNull()
    expect(result.fullName).toBe('TRƯƠNG VIỆT HÙNG')
    expect(result.key).toBe('group-key')
    expect(result.no).toBe(11)
    expect(result.attempts).toHaveLength(2)
  })

  it('trạng thái luôn là latestStatus, không lấy hồ sơ đang giữ CCCD của attempts[0]', () => {
    const group: EKYCGroup = {
      groupKey: 'group-key',
      username: '0967770769',
      userId: 'user-id',
      attemptCount: 1,
      latestStatus: 'COMPLETED',
      latestAt: '2026-09-10T14:40:15.399621',
      email: null,
      occupation: null,
      position: null,
      currentAddress: null,
      attempts: [
        {
          status: 'IN_PROGRESS',
          documentProfileStatus: 'VERIFIED',
          createdAt: '2026-09-10T14:40:15.399621'
        }
      ]
    }

    expect(mapEKYCGroupToListItem(group, 1).status).toBe('COMPLETED')
  })

  it('ưu tiên hồ sơ của chính người đó cho thông tin giấy tờ và kết quả xác thực', () => {
    const group: EKYCGroup = {
      groupKey: 'user-id',
      username: '0962341913',
      userId: 'user-id',
      attemptCount: 1,
      latestStatus: 'IN_PROGRESS',
      latestAt: '2026-09-22T11:57:44.127275',
      email: null,
      occupation: null,
      position: null,
      currentAddress: null,
      profileId: 'profile-id',
      profileStatus: 'VERIFIED',
      fullName: 'NGUYỄN THU HÀ TRANG',
      idNumber: '001195009737',
      dateOfBirth: '1995-06-15',
      gender: 'FEMALE',
      verifiedAt: '2026-09-22T12:02:41',
      attempts: [
        {
          status: 'IN_PROGRESS',
          fullName: 'NGUYEN THU HA TRANG (OCR lỗi)',
          idNumber: '001195009737',
          createdAt: '2026-09-22T11:57:44.127275'
        }
      ]
    }

    const result = mapEKYCGroupToListItem(group, 1)

    expect(result.status).toBe('IN_PROGRESS')
    expect(result.profileStatus).toBe('VERIFIED')
    expect(result.fullName).toBe('NGUYỄN THU HÀ TRANG')
    expect(result.gender).toBe('FEMALE')
    expect(result.verifiedAt).toBe('2026-09-22T12:02:41')
  })

  it('lấy OCR lần mới nhất theo session thay vì attempts[0] khi hồ sơ verified đứng đầu', () => {
    const group: EKYCGroup = {
      groupKey: 'user-id',
      userId: 'user-id',
      username: '0901234567',
      attemptCount: 2,
      latestStatus: 'PENDING_REVIEW',
      latestAt: '2026-09-28T11:00:00',
      reviewStatus: 'VERIFIED',
      pendingReview: true,
      faceScore: 92.5,
      email: null,
      occupation: null,
      position: null,
      currentAddress: null,
      attempts: [
        {
          sessionId: 'verified',
          status: 'COMPLETED',
          fullName: 'Hồ sơ cũ',
          createdAt: '2026-09-27T10:00:00'
        },
        {
          sessionId: 'pending',
          status: 'PENDING_REVIEW',
          fullName: 'OCR mới',
          createdAt: '2026-09-28T11:00:00'
        }
      ]
    }

    const result = mapEKYCGroupToListItem(group, 1)
    expect(result.sessionId).toBe('pending')
    expect(result.fullName).toBe('OCR mới')
    expect(result.pendingReview).toBe(true)
    expect(result.faceScore).toBe(92.5)
  })
})
