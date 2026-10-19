import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { EkycReviewPanel } from '../EkycReviewPanel'

const renderPanel = (
  approvalReady: boolean,
  props: Partial<React.ComponentProps<typeof EkycReviewPanel>> = {}
) => {
  server.use(
    http.get('*/verified-kyc-profiles/session-123', () =>
      HttpResponse.json({
        success: true,
        data: {
          sessionId: 'session-123',
          status: 'PENDING_REVIEW',
          approvalReady,
          createdAt: '2026-09-28T11:00:00'
        }
      })
    )
  )
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:ADMIN:FULL']))
  const onUpdated = vi.fn()
  render(
    <Provider store={store}>
      <MessageProvider>
        <EkycReviewPanel
          sessionId='session-123'
          onUpdated={onUpdated}
          {...props}
        />
      </MessageProvider>
    </Provider>
  )
  return { onUpdated }
}

describe('EkycReviewPanel', () => {
  it('khóa duyệt khi chi tiết phiên chưa đủ điều kiện', async () => {
    renderPanel(false)
    expect(
      await screen.findByText(/chưa đủ điều kiện duyệt/)
    ).toBeInTheDocument()
    // Không duyệt được thì không hiện nút duyệt; vẫn từ chối được.
    await screen.findByRole('button', { name: 'Từ chối phiên' })
    expect(screen.queryByRole('button', { name: 'Duyệt phiên' })).toBeNull()
  })

  it('duyệt đúng sessionId sau khi xác nhận rồi tải lại lưới', async () => {
    let called = 0
    server.use(
      http.post('*/verified-kyc-profiles/session-123/approve', () => {
        called += 1
        return HttpResponse.json({
          success: true,
          data: { status: 'MANUALLY_APPROVED' }
        })
      })
    )
    const { onUpdated } = renderPanel(true)
    fireEvent.click(await screen.findByRole('button', { name: 'Duyệt phiên' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận duyệt' }))
    await waitFor(() => expect(called).toBe(1))
    await waitFor(() => expect(onUpdated).toHaveBeenCalledOnce())
  })

  it('mở xác nhận duyệt từ bảng mà không cần chọn phiên trong lịch sử', async () => {
    renderPanel(true, { initialDecision: 'approve' })
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Xác nhận duyệt' })
      ).toBeEnabled()
    )
    expect(screen.queryByRole('button', { name: 'Duyệt phiên' })).toBeNull()
  })

  it('chỉ xem chi tiết phiên trong lịch sử, không có nút xét duyệt', async () => {
    renderPanel(true, { readOnly: true })
    expect(await screen.findByText(/Trạng thái:/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Duyệt phiên' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Từ chối phiên' })).toBeNull()
  })
})
