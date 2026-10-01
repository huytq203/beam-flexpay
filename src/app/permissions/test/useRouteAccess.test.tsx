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

  it('toàn bộ transaction-management bắt buộc TRANSACTION:FULL', () => {
    const viewOnly = ['EWALLET:TRANSACTION:VIEW']
    const fullAccess = ['EWALLET:TRANSACTION:FULL']
    const transactionRoutes = [
      SCREENS.TRANSACTION_MANAGEMENT.path,
      SCREENS.TRANSACTION_WALLET.path,
      `${SCREENS.TRANSACTION_WALLET.path}/transaction-id`,
      SCREENS.FROZEN_TRANSACTIONS.path,
      `${SCREENS.TRANSACTION_MANAGEMENT.path}/refund-management`,
      SCREENS.SYSTEM_LEDGER.path,
      `${SCREENS.SYSTEM_LEDGER.path}/ledger-id`,
      SCREENS.WITHDRAW_HISTORY.path
    ]

    for (const route of transactionRoutes) {
      expect(accessTo(viewOnly, route)).toBe(false)
      expect(accessTo(fullAccess, route)).toBe(true)
    }
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
