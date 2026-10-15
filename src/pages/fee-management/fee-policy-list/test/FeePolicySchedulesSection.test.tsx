import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { FeePolicySchedulesSection } from '../components/FeePolicySchedulesSection'

const base = {
  feePolicyId: 'policy-1',
  reason: 'Hết khuyến mãi',
  scheduledBy: 'admin.a',
  createdAt: '2026-10-14T03:00:00Z',
  executedAt: null,
  resultMessage: null
}
const schedules = [
  {
    ...base,
    id: 's-pending',
    action: 'DEACTIVATE',
    runAt: '2026-10-20T01:00:00Z',
    status: 'PENDING'
  },
  {
    ...base,
    id: 's-failed',
    action: 'ACTIVATE',
    runAt: '2026-10-10T01:00:00Z',
    status: 'FAILED',
    resultMessage: 'Chính sách đã bị khóa'
  },
  {
    ...base,
    id: 's-done',
    action: 'ACTIVATE',
    runAt: '2026-10-09T01:00:00Z',
    status: 'DONE'
  }
]

const renderSection = (permissions: string[] = ['EWALLET:FEE:UPDATE']) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(
    <MessageProvider>
      <FeePolicySchedulesSection policyId='policy-1' />
    </MessageProvider>,
    { store }
  )
}

describe('mục Lịch hẹn giờ của chính sách phí', () => {
  it('hiện danh sách, giờ theo Asia/Ho_Chi_Minh và huỷ lịch chờ chạy', async () => {
    let cancelled = false
    server.use(
      http.get('*/fee/policies/policy-1/schedules', () =>
        HttpResponse.json({ data: schedules })
      ),
      http.delete('*/fee/policies/policy-1/schedules/s-pending', () => {
        cancelled = true
        return HttpResponse.json({
          data: { ...schedules[0], status: 'CANCELLED' }
        })
      })
    )
    const user = userEvent.setup()
    renderSection()

    expect(await screen.findByText('Khóa chính sách')).toBeInTheDocument()
    expect(screen.getByText('20/10/2026 08:00:00')).toBeInTheDocument()
    expect(screen.getByText('Chờ chạy')).toBeInTheDocument()
    expect(screen.getByText('Lỗi')).toBeInTheDocument()
    expect(screen.queryByText('Đã chạy')).toBeNull()
    expect(screen.getByText(/Chính sách đã bị khóa/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Huỷ lịch/ })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /^Huỷ lịch/ }))
    await user.click(await screen.findByRole('button', { name: 'Huỷ lịch' }))
    await waitFor(() => expect(cancelled).toBe(true))
  })

  it('ẩn nút huỷ khi thiếu quyền của hành động đó', async () => {
    server.use(
      http.get('*/fee/policies/policy-1/schedules', () =>
        HttpResponse.json({ data: schedules })
      )
    )
    renderSection(['EWALLET:FEE:APPROVE'])
    await screen.findByText('Khóa chính sách')
    expect(screen.queryByRole('button', { name: /^Huỷ lịch/ })).toBeNull()
  })

  it('hiện trạng thái rỗng', async () => {
    renderSection()
    expect(
      await screen.findByText('Chính sách chưa có lịch hẹn giờ nào.')
    ).toBeInTheDocument()
  })

  it('hiện lỗi và cho thử lại', async () => {
    server.use(
      http.get('*/fee/policies/policy-1/schedules', () =>
        HttpResponse.json({ message: 'lỗi' }, { status: 500 })
      )
    )
    renderSection()
    expect(
      await screen.findByText('Không tải được lịch hẹn giờ.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })
})
