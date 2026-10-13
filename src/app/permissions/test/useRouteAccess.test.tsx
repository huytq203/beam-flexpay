import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { SCREENS } from '../registry'
import { useRouteAccess } from '../useRouteAccess'

const wrapperWith = (permissions: string[], route: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  )
}

const accessTo = (permissions: string[], route: string): boolean => {
  const { result } = renderHook(() => useRouteAccess(), {
    wrapper: wrapperWith(permissions, route)
  })
  return result.current
}

describe('useRouteAccess', () => {
  it('cho qua khi đủ quyền xem và chặn khi thiếu quyền', () => {
    expect(accessTo(['EWALLET:USER:VIEW'], SCREENS.USER_ACCOUNT.path)).toBe(
      true
    )
    expect(accessTo(['EWALLET:ROLE:VIEW'], SCREENS.USER_ACCOUNT.path)).toBe(
      false
    )
    expect(accessTo([], SCREENS.USER_ACCOUNT.path)).toBe(false)
  })

  it('route con thừa hưởng quyền màn cha', () => {
    expect(
      accessTo(['EWALLET:USER:VIEW'], `${SCREENS.USER_ACCOUNT.path}/123`)
    ).toBe(true)
  })

  it('path ngoài registry được cho qua', () => {
    expect(accessTo([], '/secure-panel/forbidden')).toBe(true)
    expect(accessTo([], '/')).toBe(true)
  })

  it('route FEE chấp nhận mọi action chuẩn của đúng module', () => {
    expect(accessTo([], SCREENS.FEE_POLICY.path)).toBe(false)
    expect(accessTo(['EWALLET:FEE:CREATE'], SCREENS.FEE_POLICY.path)).toBe(true)
  })

  it('các route giao dịch mở với TRANSACTION:VIEW hoặc EWALLET:FULL, chặn quyền không liên quan', () => {
    const transactionRoutes = [
      SCREENS.TRANSACTION_MANAGEMENT.path,
      SCREENS.TRANSACTION_WALLET.path,
      `${SCREENS.TRANSACTION_WALLET.path}/transaction-id`,
      SCREENS.SYSTEM_LEDGER.path,
      `${SCREENS.SYSTEM_LEDGER.path}/ledger-id`,
      SCREENS.WITHDRAW_HISTORY.path
    ]

    for (const route of transactionRoutes) {
      expect(accessTo(['EWALLET:TRANSACTION:VIEW'], route)).toBe(true)
      expect(accessTo(['EWALLET:EWALLET:FULL'], route)).toBe(true)
      expect(accessTo(['EWALLET:FEE:VIEW'], route)).toBe(false)
    }
  })

  it('đóng băng mở với FREEZE:VIEW hoặc EWALLET:FULL, không mở với TRANSACTION:VIEW', () => {
    const route = SCREENS.FROZEN_TRANSACTIONS.path
    expect(accessTo(['EWALLET:FREEZE:VIEW'], route)).toBe(true)
    expect(accessTo(['EWALLET:EWALLET:FULL'], route)).toBe(true)
    expect(accessTo(['EWALLET:TRANSACTION:VIEW'], route)).toBe(false)
  })

  it('hoàn tiền mở cho REFUND:APPROVE hoặc EWALLET:FULL, không mở cho TRANSACTION:FULL', () => {
    const route = SCREENS.REFUND_MANAGEMENT.path
    expect(accessTo(['EWALLET:REFUND:APPROVE'], route)).toBe(true)
    expect(accessTo(['EWALLET:EWALLET:FULL'], route)).toBe(true)
    expect(accessTo(['EWALLET:TRANSACTION:FULL'], route)).toBe(false)
    expect(accessTo([], route)).toBe(false)
  })

  it('eKYC chấp nhận quyền ADMIN nhưng từ chối module khác', () => {
    expect(accessTo(['EWALLET:ADMIN:VIEW'], SCREENS.CONFIRM_EKYC.path)).toBe(
      false
    )
    expect(accessTo(['EWALLET:ADMIN:FULL'], SCREENS.CONFIRM_EKYC.path)).toBe(
      true
    )
    expect(accessTo(['EWALLET:USER:FULL'], SCREENS.CONFIRM_EKYC.path)).toBe(
      false
    )
  })
})
