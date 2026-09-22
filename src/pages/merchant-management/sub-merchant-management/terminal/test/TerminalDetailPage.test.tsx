import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'

import { resetTerminalRepository } from '../hooks/useTerminals'
import TerminalDetailPage from '../pages/TerminalDetailPage'

const BASE_PATH = '/secure-panel/merchant/terminal'

const renderTerminalDetail = (id: string, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`${BASE_PATH}/detail/${id}`]}>
        <Routes>
          <Route
            path={`${BASE_PATH}/detail/:id`}
            element={<TerminalDetailPage />}
          />
          <Route
            path={`${BASE_PATH}/edit/:id`}
            element={<p>Trang sửa Terminal</p>}
          />
          <Route
            path={BASE_PATH}
            element={<p>Danh sách Terminal</p>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

beforeEach(() => resetTerminalRepository())

describe('TerminalDetailPage', () => {
  it('hiển thị quan hệ cha, cấu hình kế thừa và timeline', async () => {
    renderTerminalDetail('terminal-001', [PERMISSION.MERCHANT_VIEW])

    expect(
      await screen.findByRole('heading', { name: 'QR Quầy 02' })
    ).toBeInTheDocument()
    expect(screen.getByText('Highlands Coffee')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /HLC Nguyễn Huệ/ })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Tối đa 50.000.000 VND/giao dịch')
    ).toBeInTheDocument()
    expect(screen.getByText('Khởi tạo Terminal')).toBeInTheDocument()
    expect(screen.getByText('Cập nhật thông tin gần nhất')).toBeInTheDocument()
  })

  it('ẩn thao tác thay đổi với quyền chỉ xem', async () => {
    renderTerminalDetail('terminal-001', [PERMISSION.MERCHANT_VIEW])
    await screen.findByRole('heading', { name: 'QR Quầy 02' })

    expect(screen.queryByRole('link', { name: 'Sửa Terminal' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Khóa Terminal' })).toBeNull()
  })

  it('chặn sửa và mở khóa Terminal tạm ngưng theo Sub-merchant', async () => {
    const user = userEvent.setup()
    renderTerminalDetail('terminal-suspended', [PERMISSION.MERCHANT_UPDATE])

    expect(
      await screen.findByText('Terminal đang tạm ngưng theo Sub-merchant')
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sửa Terminal' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Mở khóa Terminal' }))
    expect(
      screen.getByText('Cần mở khóa Sub-merchant cha trước')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
  })

  it('khóa Terminal và giữ trạng thái sau khi remount', async () => {
    const user = userEvent.setup()
    const firstRender = renderTerminalDetail('terminal-001', [
      PERMISSION.MERCHANT_UPDATE
    ])

    await user.click(
      await screen.findByRole('button', { name: 'Khóa Terminal' })
    )
    await user.type(
      screen.getByLabelText('Lý do khóa'),
      'Kiểm tra thiết bị định kỳ'
    )
    await user.click(screen.getByRole('button', { name: 'Khóa' }))
    expect(await screen.findByText('Đã khóa')).toBeInTheDocument()

    firstRender.unmount()
    renderTerminalDetail('terminal-001', [PERMISSION.MERCHANT_UPDATE])
    expect(await screen.findByText('Đã khóa')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Mở khóa Terminal' })
    ).toBeInTheDocument()
  }, 10_000)

  it('hiển thị not-found và cho quay về danh sách', async () => {
    const user = userEvent.setup()
    renderTerminalDetail('missing', [PERMISSION.MERCHANT_VIEW])

    expect(
      await screen.findByText('Không tìm thấy Terminal')
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Về danh sách Terminal' })
    )
    expect(await screen.findByText('Danh sách Terminal')).toBeInTheDocument()
  })
})
