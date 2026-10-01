import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { merchantService } from '@services/apiMerchant'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import CreateMerchant from '../pages/CreateMerchant'

describe('Merchant edit form', () => {
  it('giữ tên đang sửa khi detail được làm mới để cấp lại URL tài liệu', async () => {
    server.use(
      http.get('*/merchants/merchant-1', () =>
        HttpResponse.json({
          success: true,
          data: {
            id: 'merchant-1',
            name: 'Tên ban đầu',
            mccCode: '5734',
            merchantType: 'ENTERPRISE',
            enterpriseWalletId: 'wallet-1',
            enterpriseWallet: {
              id: 'wallet-1',
              legalName: 'Công ty thử nghiệm',
              registeredEmail: 'owner@example.com',
              businessType: 'ENTERPRISE'
            }
          }
        })
      )
    )
    const store = createAppStore()
    render(
      <Provider store={store}>
        <MessageProvider>
          <MemoryRouter initialEntries={['/merchants/merchant-1/edit']}>
            <Routes>
              <Route
                path='/merchants/:id/edit'
                element={<CreateMerchant />}
              />
            </Routes>
          </MemoryRouter>
        </MessageProvider>
      </Provider>
    )
    const input = await screen.findByDisplayValue('Tên ban đầu')
    const user = userEvent.setup()
    await user.clear(input)
    await user.type(input, 'Tên đang sửa')
    await store.dispatch(
      merchantService.endpoints.getMerchantById.initiate('merchant-1', {
        forceRefetch: true
      })
    )
    expect(input).toHaveValue('Tên đang sửa')
  })
})
