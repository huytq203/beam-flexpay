import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@/app/hooks/useMessage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import FeeAssignmentApprovalAction from '@components/fee/FeeAssignmentApprovalAction'
import type { FeeAssignment } from '../../constants/feeAssignment'

const REVIEW_HASH = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

const assignment: FeeAssignment = {
  id: 'assignment-1',
  lockVersion: 3,
  reviewHash: REVIEW_HASH,
  feePolicyId: 'policy-1',
  merchantId: null,
  bankCode: 'VCB',
  paymentMethod: 'BANK_TRANSFER',
  cardType: null,
  serviceType: 'EWALLET_TRANSFER_INTERNAL',
  customerGroup: 'STANDARD',
  status: 'INIT',
  createdAt: '2026-08-06T00:00:00Z',
  updatedAt: '2026-08-06T00:00:00Z',
  createdBy: 'admin',
  updatedBy: 'admin',
  effectiveFromDate: null,
  effectiveToDate: null,
  subjectType: null,
  subjectId: null
}

const renderAction = (overrides: Partial<FeeAssignment> = {}) => {
  const user = userEvent.setup()

  renderWithProviders(
    <MessageProvider>
      <FeeAssignmentApprovalAction
        assignment={{ ...assignment, ...overrides }}
      />
    </MessageProvider>
  )

  return { user }
}

describe('FeeAssignmentApprovalAction', () => {
  it('phê duyệt gán phí, đóng popover và khóa nút sau khi thành công', async () => {
    let approveRequestCount = 0
    let approveBody: unknown = null
    let approveUrl = ''
    server.use(
      http.patch(
        '*/fee/policy-assignments/assignment-1/approve',
        async ({ request }) => {
          approveRequestCount += 1
          approveUrl = request.url
          approveBody = await request.json()
          return HttpResponse.json({ success: true, data: null })
        }
      )
    )
    const { user } = renderAction()

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt gán phí' })
    )
    await user.click(
      await screen.findByRole('button', { name: /Duyệt gán phí/ })
    )

    await waitFor(() => expect(approveRequestCount).toBe(1))
    expect(approveBody).toEqual({
      expectedLockVersion: 3,
      expectedReviewHash: REVIEW_HASH
    })
    expect(new URL(approveUrl).searchParams.has('isLoading')).toBe(false)
    expect(
      screen.getByRole('button', { name: 'Gán phí đã được xử lý' })
    ).toBeDisabled()
    expect(document.querySelector('.ant-popover')).toHaveStyle({
      pointerEvents: 'none'
    })
  })

  it('hiển thị đủ dữ liệu cần kiểm tra trước khi duyệt', async () => {
    const { user } = renderAction({
      effectiveFromDate: '2026-09-11T08:30:00Z',
      effectiveToDate: '2026-12-31T16:59:59Z'
    })

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt gán phí' })
    )

    expect(await screen.findByText('Loại giao dịch')).toBeInTheDocument()
    expect(screen.getByText('Chuyển tiền nội bộ')).toBeInTheDocument()
    expect(screen.getByText('Phạm vi áp dụng')).toBeInTheDocument()
    expect(screen.getByText('Người dùng thường')).toBeInTheDocument()
    expect(screen.getByText('Chuyển khoản ngân hàng')).toBeInTheDocument()
    expect(screen.getByText('VCB')).toBeInTheDocument()
    expect(
      screen.getByText(/Sau khi duyệt, gán phí sẽ tự động áp dụng/)
    ).toBeInTheDocument()
  })

  it('gọi API từ chối và khóa nút sau khi thành công', async () => {
    let rejectRequestCount = 0
    let rejectReason: string | null = null
    server.use(
      http.patch(
        '*/fee/policy-assignments/assignment-1/reject',
        ({ request }) => {
          rejectRequestCount += 1
          rejectReason = new URL(request.url).searchParams.get('reason')
          return HttpResponse.json({ success: true, data: null })
        }
      )
    )
    const { user } = renderAction()

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt gán phí' })
    )
    await user.click(
      await screen.findByRole('button', { name: /Từ chối duyệt/ })
    )
    await user.type(
      await screen.findByLabelText(/Lý do từ chối/),
      'Sai ngân hàng'
    )
    await user.click(
      await screen.findByRole('button', { name: 'Xác nhận từ chối' })
    )

    await waitFor(() => expect(rejectRequestCount).toBe(1))
    expect(rejectReason).toBe('Sai ngân hàng')
    expect(
      screen.getByRole('button', { name: 'Gán phí đã được xử lý' })
    ).toBeDisabled()
  })

  it('đóng popover mà không gọi API khi hủy bỏ', async () => {
    let decisionRequestCount = 0
    server.use(
      http.patch('*/fee/policy-assignments/:id/:decision', () => {
        decisionRequestCount += 1
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const { user } = renderAction()

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt gán phí' })
    )
    await user.click(await screen.findByRole('button', { name: 'Hủy bỏ' }))

    expect(document.querySelector('.ant-popover')).toHaveStyle({
      pointerEvents: 'none'
    })
    expect(
      screen.getByRole('button', { name: 'Phê duyệt gán phí' })
    ).toBeEnabled()
    expect(decisionRequestCount).toBe(0)
  })

  it('khóa nút xác nhận từ chối khi chưa nhập lý do', async () => {
    let rejectRequestCount = 0
    server.use(
      http.patch('*/fee/policy-assignments/assignment-1/reject', () => {
        rejectRequestCount += 1
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const { user } = renderAction()

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt gán phí' })
    )
    await user.click(
      await screen.findByRole('button', { name: /Từ chối duyệt/ })
    )

    expect(
      await screen.findByRole('button', { name: 'Xác nhận từ chối' })
    ).toBeDisabled()
    expect(rejectRequestCount).toBe(0)
  })

  it('không gọi API duyệt khi thiếu phiên bản kiểm duyệt', async () => {
    let approveRequestCount = 0
    server.use(
      http.patch('*/fee/policy-assignments/assignment-1/approve', () => {
        approveRequestCount += 1
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const { user } = renderAction({
      lockVersion: undefined,
      reviewHash: undefined
    })

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt gán phí' })
    )

    expect(
      await screen.findByRole('button', { name: /Duyệt gán phí/ })
    ).toBeDisabled()
    expect(approveRequestCount).toBe(0)
  })

  it.each(['ACTIVE', 'INACTIVE', 'APPROVED', 'REJECTED'])(
    'không cho xử lý lại gán phí có trạng thái %s',
    (status) => {
      renderAction({ status })

      expect(
        screen.getByRole('button', { name: 'Gán phí đã được xử lý' })
      ).toBeDisabled()
      expect(
        screen.queryByRole('button', { name: /Duyệt gán phí/ })
      ).not.toBeInTheDocument()
    }
  )
})
