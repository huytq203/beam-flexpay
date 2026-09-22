import { render, screen, waitFor } from '@testing-library/react'
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
import { suppressAntPseudoElementWarning } from './domTestSetup'

suppressAntPseudoElementWarning()

const findRenderedOption = async (name: RegExp | string): Promise<HTMLElement> => {
  const matches = await screen.findAllByText(name)
  const option = matches.find((element) =>
    element.classList.contains('ant-select-item-option-content')
  )
  if (!option) throw new Error(`Không tìm thấy option hiển thị: ${String(name)}`)
  return option
}

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

  it('khóa Merchant cha và hiển thị legal kế thừa bằng text có ngữ nghĩa', async () => {
    renderForm(
      '/secure-panel/merchant/sub-merchant/edit/sub-001',
      [PERMISSION.MERCHANT_VIEW, PERMISSION.MERCHANT_UPDATE]
    )

    expect(await screen.findByLabelText('Merchant cha')).toBeDisabled()
    expect(screen.getByText('Mã số thuế')).toHaveRole('term')
    expect(screen.getByText('0312345678').tagName).toBe('DD')
    expect(screen.getByText('Người đại diện pháp luật')).toHaveRole('term')
    expect(screen.getByText('Nguyễn Thị Minh Hằng').tagName).toBe('DD')
    expect(screen.queryByRole('textbox', { name: 'Mã số thuế' })).not.toBeInTheDocument()
  })

  it('hiển thị và cập nhật phone/address hiệu lực khi đổi Merchant cha hoặc bật kế thừa', async () => {
    const user = userEvent.setup()
    renderForm('/secure-panel/merchant/sub-merchant/create', [PERMISSION.MERCHANT_CREATE])

    const parentSelect = screen.getByRole('combobox', { name: /Merchant cha/ })
    await user.click(parentSelect)
    await user.click(await findRenderedOption(/Highlands Coffee \(MC000142\)/))
    await waitFor(() => {
      expect(screen.getByLabelText('Số điện thoại')).toHaveValue('028 7300 1122')
      expect(screen.getByLabelText('Địa chỉ')).toHaveValue(
        '123 Nguyễn Đình Chiểu, Phường Xuân Hòa, TP. Hồ Chí Minh'
      )
    })

    await user.click(screen.getByLabelText('Kế thừa số điện thoại từ Merchant cha'))
    const phoneInput = screen.getByLabelText(/Số điện thoại/)
    await user.clear(phoneInput)
    await user.type(phoneInput, '0901234567')
    await user.click(screen.getByLabelText('Kế thừa số điện thoại từ Merchant cha'))
    await waitFor(() => expect(phoneInput).toHaveValue('028 7300 1122'))

    await user.click(parentSelect)
    await user.click(await findRenderedOption(/FlexPay Mart \(MC000301\)/))
    await waitFor(() => {
      expect(screen.getByLabelText('Số điện thoại')).toHaveValue('028 7777 0301')
      expect(screen.getByLabelText('Địa chỉ')).toHaveValue(
        '301 Lê Lợi, Phường Bến Thành, TP. Hồ Chí Minh'
      )
    })
  })

  it('vô hiệu hóa Merchant cha không hoạt động trên form tạo', async () => {
    const user = userEvent.setup()
    renderForm('/secure-panel/merchant/sub-merchant/create', [PERMISSION.MERCHANT_CREATE])

    await user.click(screen.getByRole('combobox', { name: /Merchant cha/ }))
    const suspendedParent = await findRenderedOption(/GS25 Việt Nam.*Không hoạt động/)
    const lockedParent = await findRenderedOption(/Nhà thuốc An Khang.*Không hoạt động/)
    expect(suspendedParent.closest('.ant-select-item-option')).toHaveClass(
      'ant-select-item-option-disabled'
    )
    expect(lockedParent.closest('.ant-select-item-option')).toHaveClass(
      'ant-select-item-option-disabled'
    )
    await user.click(suspendedParent)
    await user.click(screen.getByRole('button', { name: 'Thêm Sub-merchant' }))

    expect(await screen.findByText('Vui lòng chọn Merchant cha')).toBeInTheDocument()
    expect(screen.queryByText('Đã chuyển sang chi tiết')).not.toBeInTheDocument()
  })

  it('tạo thành công, lưu repository và điều hướng sang chi tiết', async () => {
    const user = userEvent.setup()
    renderForm('/secure-panel/merchant/sub-merchant/create', [PERMISSION.MERCHANT_CREATE])

    await user.click(screen.getByRole('combobox', { name: /Merchant cha/ }))
    await user.click(await findRenderedOption(/Highlands Coffee \(MC000142\)/))
    await user.type(screen.getByLabelText(/Tên Sub-merchant/), 'HLC Thảo Điền')
    await user.click(screen.getByRole('combobox', { name: /Lĩnh vực kinh doanh/ }))
    await user.click(await findRenderedOption('F&B'))
    await user.click(screen.getByRole('button', { name: 'Thêm Sub-merchant' }))

    expect(await screen.findByText('Đã chuyển sang chi tiết')).toBeInTheDocument()
    expect(getSubMerchantById('sub-local-05')?.name).toBe('HLC Thảo Điền')
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

  it('chặn route sửa trực tiếp khi Merchant cha không hoạt động', async () => {
    const user = userEvent.setup()
    renderForm(
      '/secure-panel/merchant/sub-merchant/edit/sub-locked',
      [PERMISSION.MERCHANT_UPDATE]
    )

    const blockedState = await screen.findByRole('alert')
    expect(blockedState).toHaveTextContent('Không thể chỉnh sửa Sub-merchant')
    expect(blockedState).toHaveTextContent('Nhà thuốc An Khang')
    expect(screen.queryByRole('button', { name: 'Lưu thay đổi' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Tên Sub-merchant')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Về chi tiết Sub-merchant' }))
    expect(await screen.findByText('Đã chuyển sang chi tiết')).toBeInTheDocument()
  })

  it('chặn mode tạo khi thiếu quyền tạo', () => {
    renderForm(
      '/secure-panel/merchant/sub-merchant/create',
      [PERMISSION.MERCHANT_VIEW]
    )

    expect(screen.getByText('Không có quyền truy cập')).toBeInTheDocument()
  })
})
