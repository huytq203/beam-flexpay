import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MessageProvider } from '@/app/hooks/useMessage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import FeePolicyApprovalAction from '../FeePolicyApprovalAction'
import type { FeePolicy } from '../../types/FeeManagement.type'

const policy: FeePolicy = {
  id: 'policy-1',
  name: 'Phí chuyển khoản nội bộ',
  serviceType: 'EWALLET_TRANSFER_INTERNAL',
  feeDomain: 'EWALLET',
  currency: 'VND',
  validFrom: '2026-08-06T00:00:00Z',
  validTo: '',
  status: 'INIT',
  priority: 1
}

const renderAction = (overrides: Partial<FeePolicy> = {}) => {
  const user = userEvent.setup()

  renderWithProviders(
    <MessageProvider>
      <FeePolicyApprovalAction
        policy={{ ...policy, ...overrides }}
      />
    </MessageProvider>
  )

  return { user }
}

describe('FeePolicyApprovalAction', () => {
  it('phê duyệt chính sách, đóng popover và khóa nút sau khi thành công', async () => {
    let approveRequestCount = 0
    server.use(
      http.patch('*/fee/policies/policy-1/approve', () => {
        approveRequestCount += 1
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const { user } = renderAction()

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt chính sách' })
    )
    await user.click(await screen.findByRole('button', { name: /Duyệt phí/ }))

    await waitFor(() => expect(approveRequestCount).toBe(1))
    expect(
      screen.getByRole('button', { name: 'Chính sách đã được xử lý' })
    ).toBeDisabled()
    expect(document.querySelector('.ant-popover')).toHaveStyle({
      pointerEvents: 'none'
    })
  })

  it('gọi API từ chối và tải lại bảng sau khi thành công', async () => {
    let rejectRequestCount = 0
    server.use(
      http.patch('*/fee/policies/policy-1/reject', () => {
        rejectRequestCount += 1
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const { user } = renderAction()

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt chính sách' })
    )
    await user.click(
      await screen.findByRole('button', { name: /Từ chối duyệt/ })
    )

    await waitFor(() => expect(rejectRequestCount).toBe(1))
    expect(
      screen.getByRole('button', { name: 'Chính sách đã được xử lý' })
    ).toBeDisabled()
  })

  it('đóng popover mà không gọi API khi hủy bỏ', async () => {
    let decisionRequestCount = 0
    server.use(
      http.patch('*/fee/policies/:id/:decision', () => {
        decisionRequestCount += 1
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const { user } = renderAction()

    await user.click(
      screen.getByRole('button', { name: 'Phê duyệt chính sách' })
    )
    await user.click(await screen.findByRole('button', { name: 'Hủy bỏ' }))

    expect(document.querySelector('.ant-popover')).toHaveStyle({
      pointerEvents: 'none'
    })
    expect(
      screen.getByRole('button', { name: 'Phê duyệt chính sách' })
    ).toBeEnabled()
    expect(decisionRequestCount).toBe(0)
  })

  it('không cho xử lý lại chính sách đã rời trạng thái khởi tạo', () => {
    renderAction({ status: 'ACTIVE' })

    expect(
      screen.getByRole('button', { name: 'Chính sách đã được xử lý' })
    ).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: /Duyệt phí/ })
    ).not.toBeInTheDocument()
  })
})
