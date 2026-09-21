import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'

import KeyConnectionPage from '../pages/KeyConnectionPage'

const renderPage = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return renderWithProviders(<KeyConnectionPage />, { store })
}

describe('KeyConnectionPage', () => {
  it('lọc danh sách fixture theo mã Sub merchant', async () => {
    const user = userEvent.setup()
    renderPage(['EWALLET:MERCHANT:VIEW'])

    await user.type(
      await screen.findByRole('textbox', { name: 'Tìm kiếm key kết nối' }),
      'SUB-0142-01'
    )

    expect(await screen.findByText('HLC Nguyễn Huệ')).toBeInTheDocument()
    expect(screen.getByText('SUB-0142-01')).toBeInTheDocument()
    expect(screen.queryByText('Highlands Coffee')).toBeNull()
    expect(screen.queryByText('GS25 Việt Nam')).toBeNull()
  })

  it('ẩn hành động tạo và sửa với quyền chỉ xem', async () => {
    renderPage(['EWALLET:MERCHANT:VIEW'])

    await screen.findByText('HLC Nguyễn Huệ')

    expect(screen.queryByRole('button', { name: 'Thêm mới Key' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Sửa key/ })).toBeNull()
  })
})
