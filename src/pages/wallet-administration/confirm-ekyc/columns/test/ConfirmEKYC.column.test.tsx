import { ConfigProvider } from 'antd'
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { getColumn } from '../ConfirmEKYC.column'

const recordWithoutOptionalActions: EKYCListItem = {
  userId: 'user-1',
  username: 'nguyenvana',
  groupKey: 'group-1',
  attemptCount: 0,
  latestStatus: 'INVALIDATED',
  latestAt: '2026-10-06T04:00:00Z',
  email: null,
  occupation: null,
  position: null,
  no: 1,
  key: 'user-1',
  status: 'INVALIDATED',
  createdAt: '2026-10-06T04:00:00Z',
  fullName: 'Nguyễn Văn A',
  profileStatus: 'INVALIDATED',
  attempts: []
}

const renderActionCell = (
  record: EKYCListItem = recordWithoutOptionalActions
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:ADMIN:FULL']))
  const actionColumn = getColumn({
    onReview: vi.fn(),
    onViewDetail: vi.fn()
  }).find((column) => column.title === 'Thao tác')

  if (!actionColumn?.render) throw new Error('Thiếu cột thao tác eKYC')
  const content = actionColumn.render(undefined, record, 0) as ReactNode

  render(
    <Provider store={store}>
      <ConfigProvider theme={{ token: { motion: false } }}>
        <MessageProvider>{content}</MessageProvider>
      </ConfigProvider>
    </Provider>
  )
}

describe('ConfirmEKYC action column', () => {
  it('does not reserve empty slots when only the detail action is available', () => {
    renderActionCell()

    const detailButton = screen.getByRole('button', {
      name: 'Xem chi tiết hồ sơ eKYC'
    })

    expect(detailButton.parentElement?.children).toHaveLength(1)
  })

  it('hiện nhãn "Chờ xác thực lại" ở cột Xác thực và không có nút Hủy/Mở lại', () => {
    const record: EKYCListItem = {
      ...recordWithoutOptionalActions,
      profileId: 'profile-1',
      profileStatus: 'REVERIFY_REQUIRED',
      reviewStatus: 'NOT_VERIFIED'
    }
    const column = getColumn({
      onReview: vi.fn(),
      onViewDetail: vi.fn()
    }).find((item) => item.title === 'Xác thực')
    if (!column?.render) throw new Error('Thiếu cột Xác thực')
    render(<>{column.render(undefined, record, 0) as ReactNode}</>)
    expect(screen.getByText('Chờ xác thực lại')).toBeInTheDocument()

    renderActionCell(record)
    expect(screen.queryByRole('button', { name: /Mở lại eKYC/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Hủy eKYC/ })).toBeNull()
  })

  it('hiện nút Mở lại cho hồ sơ INVALID', () => {
    renderActionCell({
      ...recordWithoutOptionalActions,
      profileId: 'profile-1',
      profileStatus: 'INVALID'
    })
    expect(
      screen.getByRole('button', { name: 'Mở lại eKYC Nguyễn Văn A' })
    ).toBeInTheDocument()
  })
})
