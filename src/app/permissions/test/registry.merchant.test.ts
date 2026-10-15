import { describe, expect, it } from 'vitest'
import { PERMISSION, SCREENS } from '@/app/permissions'
import { navigationItems } from '@components/layout/components/Navigation'

describe('quyền merchant mới', () => {
  it('xóa Terminal dùng mã riêng, không dùng ADMIN_FULL', () => {
    expect(PERMISSION.TERMINAL_DELETE).toBe('EWALLET:TERMINAL:DELETE')
    expect(SCREENS.MERCHANT_TERMINAL.actions.delete).toBe(
      PERMISSION.TERMINAL_DELETE
    )
  })
  it('chấm dứt hợp tác có mã riêng', () => {
    expect(PERMISSION.MERCHANT_API_TERMINATE).toBe('EWALLET:MERCHANT:TERMINATE')
    expect(SCREENS.MERCHANT_MANAGEMENT.actions.terminate).toBe(
      PERMISSION.MERCHANT_API_TERMINATE
    )
  })
  it('cấu hình quyết toán và hạn mức rút dùng quyền SUB_MERCHANT_SETTLEMENT_CONFIG', () => {
    expect(PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_APPROVE).toBe(
      'EWALLET:SUB_MERCHANT_SETTLEMENT_CONFIG:APPROVE'
    )
    for (const id of [
      'MERCHANT_SETTLEMENT_CONFIG',
      'MERCHANT_WITHDRAWAL_LIMIT'
    ] as const) {
      expect(SCREENS[id].actions.view).toBe(
        PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW
      )
      expect(SCREENS[id].actions.update).toBe(
        PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_UPDATE
      )
      expect(SCREENS[id].actions.approve).toBe(
        PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_APPROVE
      )
    }
  })
  it('menu có mục Cấu hình quyết toán và Hạn mức rút', () => {
    const screens = navigationItems.flatMap((group) =>
      (group.children ?? []).map((item) => item.screen)
    )
    expect(screens).toContain('MERCHANT_SETTLEMENT_CONFIG')
    expect(screens).toContain('MERCHANT_WITHDRAWAL_LIMIT')
  })
})
