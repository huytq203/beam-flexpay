import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { SCREENS, SUPER_ADMIN_PERMISSION } from '@/app/permissions'
import useLandingPath from '../useLandingPath'

const wrapperWith = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

const renderLandingPath = (permissions: string[]): string | null =>
  renderHook(() => useLandingPath(), { wrapper: wrapperWith(permissions) })
    .result.current

describe('useLandingPath', () => {
  it('trả về màn đầu tiên trên sidebar khi có quyền toàn hệ thống', () => {
    expect(renderLandingPath([SUPER_ADMIN_PERMISSION])).toBe(
      SCREENS.TRANSACTION_WALLET.path
    )
  })

  it('bỏ qua nhóm không có quyền và lấy màn được phép kế tiếp', () => {
    expect(renderLandingPath(['EWALLET:ENTERPRISE_WALLET:VIEW'])).toBe(
      SCREENS.BUSINESS_WALLET_ACCOUNT.path
    )
  })

  it('trả về null khi token không có quyền vào màn nào', () => {
    expect(renderLandingPath([])).toBeNull()
  })
})
