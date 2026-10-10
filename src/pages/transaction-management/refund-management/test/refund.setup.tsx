import { render } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { PERMISSION } from '@/app/permissions'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { setAccessToken } from '@slices/authSlice'
import RefundManagement from '../RefundManagement'
import type { RefundDetail, RefundListItem } from '../schemas/refund.schema'

const base64Url = (value: object): string =>
  btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const tokenFor = (permissions: string[], username: string): string =>
  [
    base64Url({ alg: 'none' }),
    base64Url({ permissions, roles: [], preferred_username: username }),
    'sig'
  ].join('.')

export const APPROVER = [PERMISSION.REFUND_APPROVE]
export const FULL = [PERMISSION.EWALLET_FULL]

export const makeRefund = (
  overrides: Partial<RefundDetail> = {}
): RefundDetail => ({
  id: 'refund-1',
  refundCode: 'RF-20261009-000123',
  originalTransactionId: 'tx-1',
  originalTransactionCode: 'TXN20261008000456',
  channel: 'TO_WALLET',
  requestedAmount: 50000,
  originalAmount: 1000000,
  netCredit: 50000,
  netDebit: 50000,
  status: 'PENDING_APPROVAL',
  createdAt: '2026-10-09T09:15:00',
  createdSource: 'ADMIN_PORTAL',
  createdBy: 'ketoan.a',
  originalType: 'P2P_TRANSFER',
  customerName: 'Nguyễn Văn An',
  customerPhone: '0900000001',
  reason: 'Khách báo chuyển nhầm',
  ...overrides
})

/** `GET /refunds` không trả `createdBy`, `failureReason`, `originalType` (chỉ có ở chi tiết). */
export const toListItem = (refund: RefundDetail): RefundListItem => {
  const {
    createdBy: _createdBy,
    failureReason: _failureReason,
    originalType: _originalType,
    ...item
  } = refund
  return item
}

export const toPage = (content: RefundDetail[]) => ({
  data: {
    content: content.map(toListItem),
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: 20
  }
})

export const mockList = (content: () => RefundDetail[]) =>
  server.use(http.get('*/refunds', () => HttpResponse.json(toPage(content()))))

export const mockDetail = (refund: RefundDetail) =>
  server.use(
    http.get('*/refunds/:id', () => HttpResponse.json({ data: refund }))
  )

export const apiError = (detail: string, message = 'BUSINESS_ERROR') =>
  HttpResponse.json(
    { success: false, message, detail, status: '1005' },
    { status: 400 }
  )

export const renderRefundPage = (
  permissions: string[],
  username = 'ketoan.truong'
) => {
  const store = createAppStore()
  store.dispatch(setAccessToken({ token: tokenFor(permissions, username) }))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter
          initialEntries={[
            '/secure-panel/transaction-management/refund-management'
          ]}
        >
          <RefundManagement />
        </MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}
