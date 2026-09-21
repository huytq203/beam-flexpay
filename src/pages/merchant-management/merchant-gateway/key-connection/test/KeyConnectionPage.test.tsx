import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { PERMISSION } from '@/app/permissions'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'

import KeyConnectionPage from '../pages/KeyConnectionPage'
import { KeyConnectionToolbar } from '../components/KeyConnectionToolbar'

const renderPage = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return renderWithProviders(<KeyConnectionPage />, { store })
}

describe('KeyConnectionPage', () => {
  it('lọc danh sách fixture theo mã Sub merchant', async () => {
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_VIEW])

    await user.type(
      await screen.findByRole('textbox', { name: 'Từ khóa' }),
      'SUB-0142-01'
    )
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(await screen.findByText('HLC Nguyễn Huệ')).toBeInTheDocument()
    expect(screen.getByText('SUB-0142-01')).toBeInTheDocument()
    expect(screen.queryByText('Highlands Coffee')).toBeNull()
    expect(screen.queryByText('GS25 Việt Nam')).toBeNull()
  })

  it('ẩn hành động tạo và sửa với quyền chỉ xem', async () => {
    renderPage([PERMISSION.MERCHANT_VIEW])

    await screen.findByText('HLC Nguyễn Huệ')

    expect(screen.queryByRole('button', { name: 'Thêm mới Key' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Sửa key/ })).toBeNull()
  })

  it('hiển thị bộ lọc theo mẫu danh sách merchant', async () => {
    renderPage([PERMISSION.MERCHANT_VIEW])

    expect(
      await screen.findByRole('heading', { name: 'Bộ lọc tìm kiếm' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Cấp áp dụng')).toBeInTheDocument()
    expect(screen.getByLabelText('Trạng thái')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xóa bộ lọc' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tìm kiếm' })).toBeInTheDocument()
  })

  it('không cho xóa lựa chọn scope vì đã có giá trị Tất cả', () => {
    renderWithProviders(
      <KeyConnectionToolbar
        filters={{ query: '', scope: 'MASTER', status: 'ACTIVE' }}
        onSearch={() => {}}
      />
    )

    expect(document.querySelector('.ant-select-clear')).toBeNull()
  })

  it.each([
    ['loading', 'Đang tải dữ liệu'],
    ['error', 'Không tải được danh sách cấu hình merchant'],
    ['empty', 'Chưa có cấu hình'],
    ['success', 'Highlands Coffee']
  ] as const)('hiển thị trạng thái fixture %s', async (initialListState, label) => {
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.MERCHANT_VIEW]))

    renderWithProviders(
      <KeyConnectionPage initialListState={initialListState} />,
      { store }
    )

    expect(await screen.findByText(label)).toBeInTheDocument()
  })
})
