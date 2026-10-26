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
import SettlementItemListPage from '../pages/SettlementItemListPage'

suppressAntPseudoElementWarning()

const SUB_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa7'
export const PATH = '/secure-panel/merchant/settlement-item'
export const VALID_URL = `${PATH}?subMerchantId=${SUB_ID}&paidFrom=2026-10-01&paidTo=2026-10-22`

const row = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  orderId: `order-${id}`,
  orderCode: `ORD-${id}`,
  subMerchantId: SUB_ID,
  paidAt: '2026-10-21T03:15:30.123Z',
  grossAmount: 1000000,
  feeAmount: 11000,
  recognisedAmount: 989000,
  firstTrancheAmount: 889000,
  heldAmount: 100000,
  firstTrancheStatus: 'READY',
  firstTrancheWithdrawalId: null,
  holdTrancheStatus: 'HELD',
  holdTrancheWithdrawalId: null,
  holdReleaseAt: '2026-11-20T03:15:30.123Z',
  ...overrides
})

export const ITEMS = [
  row('a1'),
  row('b2', {
    grossAmount: 500000,
    feeAmount: 5500,
    recognisedAmount: 494500,
    firstTrancheAmount: 494500,
    heldAmount: 0,
    firstTrancheStatus: 'PAID',
    firstTrancheWithdrawalId: '3fa85f64-5717-4562-b3fc-2c963f66afc2',
    holdTrancheStatus: null
  })
]

export const TOTALS = {
  count: 2,
  grossAmount: 1500000,
  feeAmount: 16500,
  recognisedAmount: 1483500,
  firstTrancheAmount: 1383500,
  heldAmount: 100000
}

export const DETAIL = {
  ...row('a1'),
  masterId: 'master-1',
  lotId: 'lot-1',
  tnEligibleAt: '2026-10-22T03:15:30.123Z',
  feeQuoteSnapshot: { policy: 'FEE-01' },
  holdRuleSnapshot: {},
  lines: [
    {
      id: 'l1',
      kind: 'FIRST_TRANCHE',
      amount: 889000,
      status: 'READY',
      withdrawalRequestId: null,
      updatedAt: '2026-10-22T03:15:30.123Z'
    },
    {
      id: 'l2',
      kind: 'REFUND',
      amount: -20000,
      status: 'PAID',
      withdrawalRequestId: null,
      updatedAt: '2026-10-22T04:00:00.000Z'
    }
  ],
  grossEqualsFeePlusRecognised: true,
  recognisedEqualsTranches: false,
  singleItemForPayment: true
}

export const page = (content: unknown[]) =>
  HttpResponse.json({
    data: { content, totalElements: content.length, number: 0, size: 20 }
  })

afterEach(() => sessionStorage.clear())
beforeEach(() => {
  server.use(
    http.get('*/merchants', () => page([])),
    http.get('*/sub-merchants', () => page([])),
    http.get('*/merchant-settlement-items/totals', () =>
      HttpResponse.json({ data: TOTALS })
    ),
    http.get('*/merchant-settlement-items/:id', () =>
      HttpResponse.json({ data: DETAIL })
    ),
    http.get('*/merchant-settlement-items', () => page(ITEMS))
  )
})

export const VIEW_ONLY = [PERMISSION.SETTLEMENT_VIEW]

export const renderPage = (
  permissions: string[] = VIEW_ONLY,
  initialEntry: string = VALID_URL
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route
              element={<SettlementItemListPage />}
              path={PATH}
            />
          </Routes>
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}
