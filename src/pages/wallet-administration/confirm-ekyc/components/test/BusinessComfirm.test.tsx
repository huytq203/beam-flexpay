import { fireEvent, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
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

    // Mục OCR + cột "Giấy tờ đọc được" của 2 lần trong lịch sử
    expect(screen.getAllByText('TRƯƠNG VIỆT HÙNG').length).toBeGreaterThan(0)
    expect(screen.getAllByText('001200021829').length).toBeGreaterThan(0)
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

  it('mở rộng một lần để xem đủ giấy tờ đọc được ở lần đó', () => {
    render(
      <BusinessComfirm
        data={{
          ...profile,
          attempts: [
            { ...attempt, sessionId: 'latest', fullName: 'NGUYỄN THU HÀ TRANG', idNumber: '001195009737',
              features: 'Sẹo chấm C: 0,5cm dưới trước cánh mũi trái', documentProfileStatus: 'VERIFIED',
              documentOwnerUsername: '0962341913', documentOwnedByOtherAccount: true },
            olderAttempt
          ]
        }}
      />
    )

    expect(screen.queryByText('Sẹo chấm C: 0,5cm dưới trước cánh mũi trái')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết lần 2' }))

    expect(screen.getByRole('button', { name: 'Thu gọn lần 2' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Sẹo chấm C: 0,5cm dưới trước cánh mũi trái')).toBeInTheDocument()
    expect(screen.getByText('Đã xác thực · 0962341913 (tài khoản khác)')).toBeInTheDocument()
  })

  it('giữ dữ liệu danh sách và cho phép thử lại khi API detail lỗi', () => {
    const onRetry = vi.fn()
    render(<BusinessComfirm data={profile} isError onRetry={onRetry} />)

    expect(screen.getByText(/Đang hiển thị dữ liệu từ danh sách/)).toBeInTheDocument()
    screen.getByRole('button', { name: 'Thử lại' }).click()
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('mở sẵn phiên chờ duyệt và cho duyệt ngay trong chi tiết hồ sơ', async () => {
    server.use(
      http.get('*/verified-kyc-profiles/pending-session', () =>
        HttpResponse.json({
          success: true,
          data: {
            sessionId: 'pending-session',
            status: 'PENDING_REVIEW',
            approvalReady: true,
            createdAt: '2026-09-30T09:00:00Z'
          }
        })
      )
    )
    const store = createAppStore()
    store.dispatch(savePermissions(['EWALLET:ADMIN:FULL']))
    render(
      <Provider store={store}>
        <MessageProvider>
          <BusinessComfirm
            data={{
              ...profile,
              attempts: [
                {
                  ...attempt,
                  sessionId: 'pending-session',
                  status: 'PENDING_REVIEW',
                  createdAt: '2026-09-30T09:00:00Z'
                },
                olderAttempt
              ]
            }}
          />
        </MessageProvider>
      </Provider>
    )

    expect(
      await screen.findByRole('button', { name: 'Duyệt EKYC' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Từ chối EKYC' })).toBeInTheDocument()
  })
})
