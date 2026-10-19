import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { EkycReviewActions } from '../EkycReviewActions'

const makeRecord = (status: string): EKYCListItem =>
  ({
    fullName: 'Nguyễn Văn A',
    attempts: [
      { sessionId: 'other', status: 'IN_PROGRESS', createdAt: '' },
      { sessionId: 'target', status, createdAt: '' }
    ]
  }) as EKYCListItem

let detailRequests = 0

const mockDetail = (approvalReady: boolean, status = 'PENDING_REVIEW') => {
  detailRequests = 0
  server.use(
    http.get('*/verified-kyc-profiles/target', () => {
      detailRequests += 1
      return HttpResponse.json({
        success: true,
        data: { sessionId: 'target', status, approvalReady, createdAt: '' }
      })
    })
  )
}

const renderActions = (status = 'PENDING_REVIEW', approvalReady = true) => {
  mockDetail(approvalReady, status)
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:ADMIN:FULL']))
  const onReview = vi.fn()
  const record = makeRecord(status)
  render(
    <Provider store={store}>
      <EkycReviewActions
        record={record}
        onReview={onReview}
      />
    </Provider>
  )
  return { onReview, record }
}

describe('EkycReviewActions', () => {
  it('mở popover icon và chọn chấp nhận cho phiên chờ duyệt', async () => {
    const { onReview, record } = renderActions()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Xét duyệt eKYC Nguyễn Văn A' })
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Chấp nhận' }))
    expect(onReview).toHaveBeenCalledWith(record, 'approve')
  })

  it('ẩn icon khi không có phiên chờ duyệt', () => {
    const { onReview } = renderActions('IN_PROGRESS')
    expect(
      screen.queryByRole('button', { name: 'Xét duyệt eKYC Nguyễn Văn A' })
    ).toBeNull()
    expect(onReview).not.toHaveBeenCalled()
  })

  it('có phiên chờ duyệt nhưng chưa đủ điều kiện duyệt thì không hiện nút', async () => {
    renderActions('PENDING_REVIEW', false)
    await waitFor(() => expect(detailRequests).toBeGreaterThan(0))
    expect(
      screen.queryByRole('button', { name: 'Xét duyệt eKYC Nguyễn Văn A' })
    ).toBeNull()
  })
})
