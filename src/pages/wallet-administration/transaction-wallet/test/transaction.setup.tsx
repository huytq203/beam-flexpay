import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { PERMISSION } from '@/app/permissions'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { createAppStore } from '@/app/store'
import { setAccessToken } from '@slices/authSlice'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'

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

export const FULL = [PERMISSION.EWALLET_FULL]
export const REVIEW_ONLY = [
  PERMISSION.TRANSACTION_FULL,
  PERMISSION.TRANSACTION_REVIEW
]
export const FULL_ONLY_TRANSACTION = [PERMISSION.TRANSACTION_FULL]

export const renderAs = (
  ui: ReactElement,
  permissions: string[],
  username = 'van.hanh.a'
) => {
  const store = createAppStore()
  store.dispatch(setAccessToken({ token: tokenFor(permissions, username) }))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}

export const makeTransaction = (
  overrides: Partial<UnifiedContentJournal> = {}
): UnifiedContentJournal => ({
  id: 'journal-1',
  journalCode: 'JRN-001',
  transactionCode: 'TXN20261008000456',
  status: 'POSTED',
  transactionType: 'P2P_TRANSFER',
  from: { id: 'u1', username: '0900000001', displayName: 'An', type: 'USER' },
  to: { id: 'u2', username: '0900000002', displayName: 'Bình', type: 'USER' },
  amount: 1000000,
  grossAmount: 1000000,
  feeAmount: 0,
  currency: 'VND',
  paymentMethod: 'WALLET_BALANCE',
  bankCode: null,
  bankRefId: null,
  transactionId: 'gl-transaction-1',
  reversesJournalId: null,
  reversedByJournalId: null,
  description: 'Chuyển tiền',
  failureReason: null,
  createdAt: '2026-10-08T10:00:00',
  postedAt: '2026-10-08T10:00:05',
  archivedAt: null,
  sourceDomain: 'EWALLET',
  frozen: false,
  freeze: null,
  refundedAmount: null,
  pendingRefundAmount: null,
  refunded: null,
  displayStatus: 'POSTED',
  ...overrides
})
