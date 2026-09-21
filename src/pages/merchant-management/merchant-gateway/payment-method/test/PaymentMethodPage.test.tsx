import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'

import PaymentMethodPage from '../pages/PaymentMethodPage'

const renderPage = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return renderWithProviders(<PaymentMethodPage />, { store })
}

describe('PaymentMethodPage', () => {
  it.each([
    ['loading', 'Đang tải dữ liệu'],
    ['error', 'Không tải được danh sách cấu hình merchant'],
    ['empty', 'Chưa có cấu hình'],
    ['success', 'Highlands Coffee']
  ] as const)('hiển thị trạng thái %s của danh sách', async (initialListState, label) => {
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.MERCHANT_VIEW]))

    renderWithProviders(
      <PaymentMethodPage initialListState={initialListState} />,
      { store }
    )

    if (initialListState === 'success') {
      expect((await screen.findAllByText(label)).length).toBeGreaterThan(0)
      return
    }

    expect(await screen.findByText(label)).toBeInTheDocument()
  })

  it('lọc QR động và loại dòng ví điện tử', async () => {
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_VIEW])

    await user.click(await screen.findByLabelText('Hình thức'))
    await user.click(screen.getByText('QR động', { selector: '.ant-select-item-option-content' }))
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect((await screen.findAllByText('QR động')).length).toBeGreaterThan(1)
    expect(within(screen.getByRole('table')).queryByText('Ví điện tử')).toBeNull()
  })

  it('hiển thị cấp áp dụng Master và Sub trong bảng', async () => {
    renderPage([PERMISSION.MERCHANT_VIEW])

    const table = await screen.findByRole('table')
    expect(within(table).getAllByText('Master').length).toBeGreaterThan(0)
    expect(within(table).getByText('Sub')).toBeInTheDocument()
  })

  it('chỉ đổi trạng thái sau khi xác nhận', async () => {
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_VIEW, PERMISSION.MERCHANT_UPDATE])
    await screen.findByRole('table')
    const row = document.querySelector<HTMLElement>(
      '[data-row-key="payment-highlands-wallet"]'
    )

    expect(row).not.toBeNull()

    await user.click(within(row!).getByRole('button', { name: /Đổi trạng thái/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hủy' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(within(row!).getByText('Hoạt động')).toBeInTheDocument()

    await user.click(within(row!).getByRole('button', { name: /Đổi trạng thái/ }))
    await user.click(screen.getByRole('button', { name: 'Xác nhận tắt' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(within(row!).getByText('Ngưng hoạt động')).toBeInTheDocument()
  })

  it('báo lỗi các trường bắt buộc khi thêm hình thức thanh toán trống', async () => {
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_VIEW, PERMISSION.MERCHANT_CREATE])

    await user.click(await screen.findByRole('button', { name: 'Thêm hình thức' }))
    await user.click(screen.getByRole('button', { name: 'Lưu hình thức' }))

    expect(await screen.findByText('Vui lòng nhập mã merchant')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng chọn hình thức')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập hạn mức tối thiểu')).toBeInTheDocument()
  })
})
