import { describe, expect, it } from 'vitest'
import { PERMISSION, SCREENS } from '@/app/permissions'
import { navigationItems } from '@components/layout/components/Navigation'

const STANDARD = ['view', 'create', 'edit', 'update', 'delete', 'full'] as const

describe('quyền đối soát và báo cáo số dư merchant', () => {
  it('đối soát: xem, chạy, xác nhận dùng ba mã riêng', () => {
    const screen = SCREENS.MERCHANT_RECONCILIATION
    expect(screen.actions.view).toBe('EWALLET:MERCHANT_RECONCILIATION:VIEW')
    expect(screen.actions.run).toBe(PERMISSION.MERCHANT_RECONCILIATION_RUN)
    expect(screen.actions.confirm).toBe(
      'EWALLET:MERCHANT_RECONCILIATION:CONFIRM'
    )
  })

  it('báo cáo số dư dùng mã BALANCE_REPORT:VIEW', () => {
    expect(SCREENS.MERCHANT_BALANCE_REPORT.actions.view).toBe(
      'EWALLET:MERCHANT_BALANCE_REPORT:VIEW'
    )
  })

  it('hai màn đủ sáu hành động chuẩn', () => {
    for (const id of [
      'MERCHANT_RECONCILIATION',
      'MERCHANT_BALANCE_REPORT'
    ] as const)
      for (const action of STANDARD)
        expect(SCREENS[id].actions[action]).toBeTruthy()
  })

  it('menu có hai mục mới trỏ đúng đường dẫn route', () => {
    const items = navigationItems.flatMap((group) => group.children ?? [])
    expect(items.find((item) => item.key === 'reconciliation')?.link).toBe(
      SCREENS.MERCHANT_RECONCILIATION.path
    )
    expect(items.find((item) => item.key === 'balance-report')?.link).toBe(
      SCREENS.MERCHANT_BALANCE_REPORT.path
    )
  })
})
