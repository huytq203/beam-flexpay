import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { renderWithProviders } from '@/test/render'
import { savePermissions } from '@slices/authSlice'

import NotificationPage from '../pages/NotificationPage'

const renderPage = () => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.MERCHANT_VIEW]))
  return renderWithProviders(<NotificationPage />, { store })
}

describe('NotificationPage', () => {
  it('chỉ hiển thị đích nhận đã che', async () => {
    renderPage()

    expect(await screen.findByText('o***@highlands.vn')).toBeInTheDocument()
    expect(screen.queryByText('ops@highlands.vn')).toBeNull()
  })

  it('lọc danh sách theo kênh Email', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByLabelText('Kênh'))
    await user.click(screen.getByText('Email', { selector: '.ant-select-item-option-content' }))
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(await screen.findByText('o***@highlands.vn')).toBeInTheDocument()
    expect(screen.getByText('f***@gs25.com.vn')).toBeInTheDocument()
    expect(screen.queryByText('******3456')).toBeNull()
  })

  it.each([
    ['loading', 'Đang tải dữ liệu'],
    ['error', 'Không tải được danh sách cấu hình merchant'],
    ['empty', 'Chưa có cấu hình'],
    ['success', 'Highlands Coffee']
  ] as const)('hiển thị trạng thái %s', async (initialListState, label) => {
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.MERCHANT_VIEW]))
    renderWithProviders(<NotificationPage initialListState={initialListState} />, { store })
    expect(await screen.findByText(label)).toBeInTheDocument()
  })

  it('thử lại từ trạng thái lỗi và hiển thị dữ liệu fixture', async () => {
    const user = userEvent.setup()
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.MERCHANT_VIEW]))
    renderWithProviders(<NotificationPage initialListState='error' />, { store })

    await user.click(await screen.findByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByText('Highlands Coffee')).toBeInTheDocument()
  })
})
