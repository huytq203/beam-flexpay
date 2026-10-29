import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { EscrowOverview, EscrowRow } from '../types/merchantEscrow.types'

/** Một dòng danh sách Master mặc định: thiếu 30 triệu, đạt 40%. */
export const escrowRow = (over: Partial<EscrowRow> = {}): EscrowRow => ({
  masterId: 'master-1',
  code: 'MC000001',
  name: 'Công ty Alpha',
  activeSubMerchants: 3,
  state: 'SHORT',
  requirementMode: 'FIXED',
  requiredAmount: 50_000_000,
  balance: 20_000_000,
  shortfall: 30_000_000,
  surplus: 0,
  percent: 40,
  risk: 'MEDIUM',
  deadlineAt: '2026-11-30T00:00:00Z',
  daysLeft: 12,
  overdue: false,
  allowTransfer: true,
  allowSetoff: false,
  balanceSyncedAt: '2026-10-29T03:00:00Z',
  waitingOrders: 2,
  ...over
})

/** Tổng quan một Master (Task 3 dùng); mặc định cùng số liệu với `escrowRow`. */
export const escrowOverview = (
  over: Partial<EscrowOverview> = {}
): EscrowOverview => ({
  masterId: 'master-1',
  masterCode: 'MC000001',
  masterName: 'Công ty Alpha',
  current: null,
  pending: null,
  state: 'SHORT',
  requiredAmount: 50_000_000,
  balance: 20_000_000,
  shortfall: 30_000_000,
  surplus: 0,
  percent: 40,
  deadlineAt: '2026-11-30T00:00:00Z',
  daysLeft: 12,
  overdue: false,
  ...over
})

export const renderWithStore = (
  ui: ReactElement,
  permissions: string[],
  initialEntry = '/'
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>
      </Provider>
    )
  }
}
