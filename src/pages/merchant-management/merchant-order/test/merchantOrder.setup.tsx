import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { suppressAntPseudoElementWarning } from '../../sub-merchant-management/sub-merchant/test/domTestSetup'
import MerchantOrderListPage from '../pages/MerchantOrderListPage'

suppressAntPseudoElementWarning()

const order = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  merchantId: 'merchant-1',
  subMerchantId: null,
  merchantName: 'Công ty Cà phê Mộc',
  merchantCode: 'MC0001',
  orderCode: `ORD-${id}`,
  orderDescription: 'Thanh toan don hang',
  netAmount: 495500,
  amount: 500000,
  currency: 'VND',
  status: 'ACTIVE',
  bankCode: 'VPB',
  expiredAt: '2099-10-22T18:30:00',
  createdAt: '2026-10-22T10:15:30',
  updatedAt: '2026-10-22T10:15:30',
  feeAmount: 4500,
  creditFailureReason: null,
  ...overrides
})

export const ORDERS = [
  order('a1'),
  order('b2', {
    status: 'CREDIT_RECONCILIATION_REQUIRED',
    creditFailureReason: 'Chưa rõ kết quả ghi có ví merchant'
  }),
  order('c3', { status: 'SUCCESS' })
]

export const page = (content: unknown[]) =>
  HttpResponse.json({
    data: {
      content,
      totalElements: content.length,
      number: 0,
      size: 20
    }
  })

afterEach(() => sessionStorage.clear())
beforeEach(() => {
  server.use(
    http.get('*/merchants', () => page([])),
    http.get('*/sub-merchants', () => page([])),
    http.get('*/merchant-orders', () => page(ORDERS)),
    http.get('*/merchant-orders/payment-anomalies', () => page([]))
  )
})

export const VIEW_ONLY = [PERMISSION.ORDER_VIEW]
export const FULL_ACCESS = [
  PERMISSION.ORDER_VIEW,
  PERMISSION.ORDER_CREATE,
  PERMISSION.ORDER_UPDATE
]

export const renderPage = (
  permissions: string[] = FULL_ACCESS,
  search = ''
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter
          initialEntries={[`/secure-panel/merchant/merchant-order${search}`]}
        >
          <Routes>
            <Route
              element={<MerchantOrderListPage />}
              path='/secure-panel/merchant/merchant-order'
            />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}
