import { render, screen } from '@testing-library/react'
import type { ContentEKYC, EKYCListItem } from '@type/apiResponseEKYC'
import { describe, expect, it, vi } from 'vitest'
import BusinessComfirm from '../BusinessComfirm'

const attempt: ContentEKYC = {
  id: 'profile-id',
  userId: 'user-id',
  username: '0967770769',
  ekycSessionId: 'session-id',
  currentStep: 'FACE_COMPARE',
  idNumber: '001200021829',
  fullName: 'TRƯƠNG VIỆT HÙNG',
  dateOfBirth: '1990-02-01',
  gender: 'MALE',
  nationality: 'Việt Nam',
  permanentAddress: 'Hà Nội',
  currentAddress: 'Hà Nội',
  placeOfBirth: 'Hà Nội',
  issueDate: '2021-01-01',
  issuePlace: 'Cục CS QLHC về TTXH',
  expiryDate: '2031-01-01',
  cardType: 'CCCD',
  oldIdNumber: '',
  faceMatchScore: 95,
  verifiedAt: '2026-09-01T08:00:00Z',
  status: 'VERIFIED',
  invalidationReason: '',
  invalidatedAt: '',
  invalidatedBy: '',
  createdAt: '2026-09-01T08:00:00Z',
  updatedAt: '2026-09-01T08:00:00Z',
  createdBy: 'admin',
  updatedBy: 'admin'
}

const olderAttempt: ContentEKYC = {
  ...attempt,
  sessionId: 'older-session-id',
  ekycSessionId: undefined,
  status: 'REJECTED',
  currentStep: 'OCR',
  faceMatchScore: 61.25,
  createdAt: '2026-08-31T08:00:00Z',
  startedAt: '2026-08-31T08:00:00Z',
  completedAt: '2026-08-31T08:05:00Z'
}

const profile: EKYCListItem = {
  ...attempt,
  userId: 'user-id',
  username: '0967770769',
  groupKey: 'group-key',
  attemptCount: 2,
  latestStatus: 'VERIFIED',
  latestAt: attempt.createdAt,
  email: null,
  occupation: null,
  position: null,
  attempts: [attempt, olderAttempt],
  no: 1,
  key: 'group-key'
}

describe('BusinessComfirm', () => {
  it('hiển thị dữ liệu hồ sơ và không còn tab Thẻ/TK Ngân hàng', () => {
    render(<BusinessComfirm data={profile} />)

    expect(screen.getByText('TRƯƠNG VIỆT HÙNG')).toBeInTheDocument()
    expect(screen.getByText('001200021829')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByText('Thẻ/TK Ngân hàng')).not.toBeInTheDocument()
  })

  it('hiển thị toàn bộ các lần thực hiện trong group attempts', () => {
    render(
      <BusinessComfirm
        data={{
          ...profile,
          attempts: [{ ...attempt, status: 'COMPLETED' }, olderAttempt]
        }}
      />
    )

    expect(screen.getByText('2 lần thực hiện')).toBeInTheDocument()
    expect(screen.getByText('Thành công')).toBeInTheDocument()
    expect(screen.getByText(/Session: session-id/)).toBeInTheDocument()
    expect(screen.getByText(/older-session-id/)).toBeInTheDocument()
    expect(screen.getByText('Đối chiếu khuôn mặt')).toBeInTheDocument()
    expect(screen.getByText('Trích xuất thông tin')).toBeInTheDocument()
  })

  it('giữ dữ liệu danh sách và cho phép thử lại khi API detail lỗi', () => {
    const onRetry = vi.fn()
    render(<BusinessComfirm data={profile} isError onRetry={onRetry} />)

    expect(screen.getByText(/Đang hiển thị dữ liệu từ danh sách/)).toBeInTheDocument()
    screen.getByRole('button', { name: 'Thử lại' }).click()
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
