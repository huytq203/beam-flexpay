import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import BusinessWalletForm from '../pages/BusinessWalletForm'
import { merchantEnterpriseWalletService } from '@services/merchantEnterpriseWalletApi'

const renderForm = (route: string) => {
  const store = createAppStore()
  store.dispatch(
    savePermissions([
      'EWALLET:ENTERPRISE_WALLET:CREATE',
      'EWALLET:ENTERPRISE_WALLET:UPDATE'
    ])
  )
  const view = render(
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
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
  return { ...view, store }
}

describe('BusinessWalletForm Merchant API', () => {
  it('shows the existing form sections with business type', () => {
    renderForm('/business-wallet-account/create')
    expect(
      screen.getByRole('heading', { name: 'Thêm mới ví doanh nghiệp' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Thông tin tài khoản' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Hồ sơ pháp lý (đính kèm)' })
    ).toBeInTheDocument()
    expect(screen.getByText('Loại hình kinh doanh')).toBeInTheDocument()
  })

  it('blocks an empty create form before an API request', async () => {
    let requests = 0
    server.use(
      http.post('*/enterprise-wallets', () => {
        requests += 1
        return HttpResponse.json({ data: null })
      })
    )
    const user = userEvent.setup()
    renderForm('/business-wallet-account/create')
    await user.click(screen.getByRole('button', { name: /Hoàn tất & Tạo/ }))
    expect(
      await screen.findByText('Vui lòng nhập tên doanh nghiệp')
    ).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it('loads edit data from enterprise wallet detail', async () => {
    server.use(
      http.get('*/enterprise-wallets/:id', () =>
        HttpResponse.json({
          data: {
            id: 'wallet-1',
            registeredEmail: 'finance@example.com',
            legalName: 'Công ty Sao Việt',
            taxCode: '0301234567',
            businessType: 'ENTERPRISE',
            verificationStatus: 'DRAFT',
            legalRepresentativeName: 'Nguyễn Văn A',
            managerName: 'Nguyễn Văn A',
            internalWallet: true
          },
          success: true
        })
      )
    )
    renderForm('/business-wallet-account/edit/wallet-1')
    expect(
      await screen.findByDisplayValue('Công ty Sao Việt')
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('finance@example.com')).toBeDisabled()
  })

  it('giữ chỉnh sửa chưa lưu khi detail được làm mới để cấp lại URL ảnh', async () => {
    server.use(
      http.get('*/enterprise-wallets/wallet-1', () =>
        HttpResponse.json({
          success: true,
          data: {
            id: 'wallet-1',
            registeredEmail: 'finance@example.com',
            legalName: 'Công ty Sao Việt',
            verificationStatus: 'DRAFT'
          }
        })
      )
    )
    const { store } = renderForm('/business-wallet-account/edit/wallet-1')
    const name = await screen.findByDisplayValue('Công ty Sao Việt')
    await userEvent.setup().clear(name)
    await userEvent.setup().type(name, 'Tên đang sửa')
    await store.dispatch(
      merchantEnterpriseWalletService.endpoints.getEnterpriseWallet.initiate(
        'wallet-1',
        { forceRefetch: true }
      )
    )
    expect(name).toHaveValue('Tên đang sửa')
  })
})
