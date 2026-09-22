import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/useMessage'
import { savePermissions } from '@slices/authSlice'

import {
  getSubMerchantById,
  resetSubMerchantRepository
} from '../hooks/useSubMerchants'
import SubMerchantFormPage from '../pages/SubMerchantFormPage'

const renderForm = (route: string, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path='/secure-panel/merchant/sub-merchant/create' element={<SubMerchantFormPage />} />
            <Route path='/secure-panel/merchant/sub-merchant/edit/:id' element={<SubMerchantFormPage />} />
            <Route path='/secure-panel/merchant/sub-merchant/detail/:id' element={<p>Đã chuyển sang chi tiết</p>} />
            <Route path='/secure-panel/merchant/sub-merchant' element={<p>Đã về danh sách</p>} />
            <Route path='/secure-panel/forbidden' element={<p>Không có quyền truy cập</p>} />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}

describe('SubMerchantFormPage', () => {
  beforeEach(() => resetSubMerchantRepository())

  it('khóa Merchant cha và legal kế thừa ở mode sửa', async () => {
    renderForm(
      '/secure-panel/merchant/sub-merchant/edit/sub-001',
      [PERMISSION.MERCHANT_VIEW, PERMISSION.MERCHANT_UPDATE]
    )

    expect(await screen.findByLabelText('Merchant cha')).toBeDisabled()
    expect(screen.getByLabelText('Mã số thuế')).toHaveAttribute('readonly')
    expect(screen.getByLabelText('Người đại diện pháp luật')).toHaveAttribute('readonly')
  })

  it('cập nhật repository và điều hướng sang chi tiết sau khi lưu', async () => {
    const user = userEvent.setup()
    renderForm(
      '/secure-panel/merchant/sub-merchant/edit/sub-001',
      [PERMISSION.MERCHANT_UPDATE]
    )

    const nameInput = await screen.findByDisplayValue('HLC Nguyễn Huệ')
    await user.clear(nameInput)
    await user.type(nameInput, 'HLC Nguyễn Huệ mới')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(await screen.findByText('Đã chuyển sang chi tiết')).toBeInTheDocument()
    expect(getSubMerchantById('sub-001')?.name).toBe('HLC Nguyễn Huệ mới')
  })

  it('hiển thị liên kết cấu hình thay vì nhúng biểu mẫu con', async () => {
    renderForm(
      '/secure-panel/merchant/sub-merchant/edit/sub-001',
      [PERMISSION.MERCHANT_VIEW, PERMISSION.MERCHANT_UPDATE]
    )

    expect(await screen.findByRole('link', { name: 'Tài khoản ngân hàng' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Key kết nối' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hình thức thanh toán' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cấu hình thông báo' })).toBeInTheDocument()
  })

  it('hiển thị not-found và cho quay về danh sách', async () => {
    const user = userEvent.setup()
    renderForm(
      '/secure-panel/merchant/sub-merchant/edit/missing',
      [PERMISSION.MERCHANT_UPDATE]
    )

    expect(await screen.findByText('Không tìm thấy Sub-merchant')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Về danh sách Sub-merchant' }))
    expect(await screen.findByText('Đã về danh sách')).toBeInTheDocument()
  })

  it('chặn mode tạo khi thiếu quyền tạo', () => {
    renderForm(
      '/secure-panel/merchant/sub-merchant/create',
      [PERMISSION.MERCHANT_VIEW]
    )

    expect(screen.getByText('Không có quyền truy cập')).toBeInTheDocument()
  })
})
