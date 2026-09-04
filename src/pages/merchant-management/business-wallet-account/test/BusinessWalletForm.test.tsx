import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { MessageProvider } from '@hooks/useMessage'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import type { ContentAccountWallet } from '@type/responseAccountWallet'

import BusinessWalletForm from '../pages/BusinessWalletForm'

const walletDetail: ContentAccountWallet = {
  id: 'wallet-business-1',
  ownerId: 'merchant-001',
  ownerType: 'MERCHANT',
  ownerUsername: 'Công ty TNHH Sao Việt',
  glCode: 'MERCHANT_WALLET_VND',
  currency: 'VND',
  totalDebit: 0,
  totalCredit: 0,
  balance: 0,
  holdBalance: 0,
  availableBalance: 0,
  version: 1,
  status: 'ACTIVE',
  enabled: true,
  checksum: 'checksum',
  lockedReason: '',
  lockedAt: '',
  lockedBy: '',
  createdAt: '2026-09-01T08:30:00',
  updatedAt: '2026-09-02T09:30:00',
  createdBy: 'admin.cms',
  updatedBy: 'admin.cms',
  linkedBanks: []
}

const renderForm = (permissions: string[], route: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path='/business-wallet-account/create'
              element={<BusinessWalletForm />}
            />
            <Route
              path='/business-wallet-account/edit/:id'
              element={<BusinessWalletForm />}
            />
            <Route
              path='/secure-panel/forbidden'
              element={<p>Không có quyền truy cập</p>}
            />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}

describe('BusinessWalletForm', () => {
  it('mode thêm mới hiển thị đủ năm section', () => {
    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')

    expect(screen.getByRole('heading', { name: 'Thêm mới ví doanh nghiệp' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Thông tin tài khoản' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Định danh doanh nghiệp' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Người quản lý tài khoản ví' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Hồ sơ pháp lý (đính kèm)' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Phân loại tài khoản' })).toBeInTheDocument()
  })

  it('không render nút Lưu nháp', () => {
    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')
    expect(screen.queryByRole('button', { name: /Lưu nháp/ })).toBeNull()
  })

  it('submit form rỗng hiện lỗi bắt buộc và không gọi API', async () => {
    let requestCount = 0
    server.use(
      http.post('*/wallet/accounts', () => {
        requestCount += 1
        return HttpResponse.json({ data: null, success: true, status: '1000' })
      })
    )
    const user = userEvent.setup()

    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')
    await user.click(screen.getByRole('button', { name: /Hoàn tất & Tạo/ }))

    expect(await screen.findByText('Vui lòng nhập tên doanh nghiệp')).toBeInTheDocument()
    expect(screen.getByText('Mã số thuế gồm 10 hoặc 13 số')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng tải lên Giấy phép ĐKKD')).toBeInTheDocument()
    expect(requestCount).toBe(0)
  })

  it('nút Sao chép điền SĐT liên hệ sang SĐT nhận OTP', async () => {
    const user = userEvent.setup()
    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')

    await user.type(screen.getByLabelText(/SĐT liên hệ/), '0283822456')
    await user.click(screen.getByRole('button', { name: 'Sao chép' }))

    expect(screen.getByLabelText(/SĐT nhận OTP/)).toHaveValue('0283822456')
    expect(
      await screen.findByText('Đã sao chép SĐT liên hệ sang SĐT nhận OTP')
    ).toBeInTheDocument()
  })

  it('không xóa SĐT nhận OTP khi SĐT liên hệ đang trống', async () => {
    const user = userEvent.setup()
    renderForm(['EWALLET:MERCHANT:CREATE'], '/business-wallet-account/create')

    const otpPhoneInput = screen.getByLabelText(/SĐT nhận OTP/)
    await user.type(otpPhoneInput, '0912345678')
    await user.click(screen.getByRole('button', { name: 'Sao chép' }))

    expect(otpPhoneInput).toHaveValue('0912345678')
    expect(
      await screen.findByText('Vui lòng nhập SĐT liên hệ trước khi sao chép')
    ).toBeInTheDocument()
  })

  it('mode cập nhật prefill tên doanh nghiệp và khóa email', async () => {
    server.use(
      http.get('*/wallet/accounts/wallet-business-1', () =>
        HttpResponse.json({ data: walletDetail, success: true, status: '1000' })
      )
    )

    renderForm(
      ['EWALLET:MERCHANT:UPDATE'],
      '/business-wallet-account/edit/wallet-business-1'
    )

    expect(await screen.findByDisplayValue('Công ty TNHH Sao Việt')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email đăng ký/)).toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Cập nhật ví doanh nghiệp' })).toBeInTheDocument()
  })

  it('mode cập nhật gặp lỗi API thì cho thử lại', async () => {
    let requestCount = 0
    server.use(
      http.get('*/wallet/accounts/wallet-business-1', () => {
        requestCount += 1
        return requestCount === 1
          ? HttpResponse.json({ message: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
          : HttpResponse.json({ data: walletDetail, success: true, status: '1000' })
      })
    )
    const user = userEvent.setup()

    renderForm(
      ['EWALLET:MERCHANT:UPDATE'],
      '/business-wallet-account/edit/wallet-business-1'
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không tải được hồ sơ ví doanh nghiệp'
    )
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByDisplayValue('Công ty TNHH Sao Việt')).toBeInTheDocument()
  })

  it('mode cập nhật hiển thị trạng thái không tìm thấy', async () => {
    server.use(
      http.get('*/wallet/accounts/missing-wallet', () =>
        HttpResponse.json({ message: 'NOT_FOUND' }, { status: 404 })
      )
    )

    renderForm(
      ['EWALLET:MERCHANT:UPDATE'],
      '/business-wallet-account/edit/missing-wallet'
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không tìm thấy ví doanh nghiệp'
    )
    expect(
      screen.getByRole('button', { name: 'Về danh sách ví doanh nghiệp' })
    ).toBeInTheDocument()
  })

  it('thiếu quyền tạo thì chuyển sang trang không có quyền', () => {
    renderForm(['EWALLET:MERCHANT:VIEW'], '/business-wallet-account/create')

    expect(screen.getByText('Không có quyền truy cập')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Thông tin tài khoản' })).toBeNull()
  })
})
