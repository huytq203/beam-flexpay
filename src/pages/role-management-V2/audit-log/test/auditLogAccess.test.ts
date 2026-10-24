import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { SCREENS } from '@/app/permissions/registry'
import { navigationItems } from '@/components/layout/components/Navigation'

describe('quyền và menu Nhật ký hệ thống', () => {
  it('xem cần AUDIT:VIEW, xuất cần AUDIT:EXPORT riêng, màn chỉ đọc', () => {
    const { actions, accessPermission } = SCREENS.AUDIT_LOG
    expect(PERMISSION.AUDIT_EXPORT).toBe('EWALLET:AUDIT:EXPORT')
    expect(accessPermission).toBe(PERMISSION.AUDIT_VIEW)
    expect(actions.view).toBe(PERMISSION.AUDIT_VIEW)
    expect(actions.export).toBe(PERMISSION.AUDIT_EXPORT)
    for (const action of [
      'create',
      'edit',
      'update',
      'delete',
      'full'
    ] as const)
      expect(actions[action]).toBe(PERMISSION.ADMIN_FULL)
  })

  it('menu đặt trong nhóm tài khoản và phân quyền', () => {
    const group = navigationItems.find((item) =>
      (item.children ?? []).some((child) => child.screen === 'AUDIT_LOG')
    )
    expect(group?.groupLabel).toBe('Nhóm tài khoản và phân quyền')
  })
})
