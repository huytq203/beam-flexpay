import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { EkycReviewActions } from '../EkycReviewActions'

const makeRecord = (status: string): EKYCListItem =>
  ({
    fullName: 'Nguyễn Văn A',
    attempts: [
      { sessionId: 'other', status: 'PENDING_REVIEW', createdAt: '' },
      { sessionId: 'target', status, createdAt: '' }
    ]
  }) as EKYCListItem

const renderActions = (status = 'PENDING_REVIEW') => {
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
  it('mở popover icon và chọn chấp nhận cho attempts[1]', async () => {
    const { onReview, record } = renderActions()
    fireEvent.click(
      screen.getByRole('button', { name: 'Xét duyệt eKYC Nguyễn Văn A' })
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Chấp nhận' }))
    expect(onReview).toHaveBeenCalledWith(record, 'approve')
  })

  it('ẩn icon khi attempts[1] chưa chờ duyệt', () => {
    const { onReview } = renderActions('IN_PROGRESS')
    expect(
      screen.queryByRole('button', { name: 'Xét duyệt eKYC Nguyễn Văn A' })
    ).toBeNull()
    expect(onReview).not.toHaveBeenCalled()
  })
})
