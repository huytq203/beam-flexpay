import { describe, expect, it } from 'vitest'
import { navigationItems } from '@components/layout/components/Navigation'
import { PERMISSION } from '../permission-codes'
import {
  DEFAULT_SCREEN_ACTION_IDS,
  findScreenByPath,
  SCREENS,
  type ScreenAccess,
  type ScreenId
} from '../registry'

const screens: ScreenAccess[] = Object.values(SCREENS)

describe('SCREENS', () => {
  it('không có hai màn trùng path', () => {
    const paths = screens.map((screen) => screen.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('mọi path và alias đều nằm dưới secure-panel', () => {
    for (const screen of screens) {
      expect(screen.path.startsWith('/secure-panel/')).toBe(true)
      if (!screen.aliasPaths) continue

      for (const alias of screen.aliasPaths) {
        expect(alias.startsWith('/secure-panel/')).toBe(true)
      }
    }
  })

  it('khai đúng các màn identity đặc biệt', () => {
    expect(SCREENS.USER_ACCOUNT.actions.view).toBe(PERMISSION.USER_VIEW)
    expect(SCREENS.USER_ACCOUNT.actions.assignRoles).toBe(PERMISSION.USER_UPDATE)
    expect(SCREENS.CONFIRM_EKYC.actions.view).toBe(PERMISSION.ADMIN_VIEW)
    expect(SCREENS.CONFIRM_EKYC.actions.approve).toBe(PERMISSION.ADMIN_FULL)
  })

  it('phân quyền duyệt KYB ví và duyệt Merchant theo hai API riêng', () => {
    expect(SCREENS.BUSINESS_WALLET_ACCOUNT.actions.approve).toBe(PERMISSION.ENTERPRISE_WALLET_KYB_APPROVE)
    expect(SCREENS.MERCHANT_MANAGEMENT.actions.approve).toBe(PERMISSION.MERCHANT_API_APPROVE)
  })

  it('khai báo ba màn cấu hình cổng merchant', () => {
    expect(SCREENS.MERCHANT_KEY_CONNECTION.path).toBe(
      '/secure-panel/merchant/key-connection'
    )
    expect(SCREENS.MERCHANT_PAYMENT_METHOD.path).toBe(
      '/secure-panel/merchant/payment-method'
    )
    expect(SCREENS.MERCHANT_NOTIFICATION.path).toBe(
      '/secure-panel/merchant/notification'
    )
  })

  it('đăng ký hai màn Sub-merchant và Terminal bằng quyền API riêng', () => {
    expect(SCREENS.MERCHANT_SUB_MERCHANT.path).toBe(
      '/secure-panel/merchant/sub-merchant'
    )
    expect(SCREENS.MERCHANT_TERMINAL.path).toBe('/secure-panel/merchant/terminal')
    expect(SCREENS.MERCHANT_SUB_MERCHANT.actions.view).toBe(
      PERMISSION.SUB_MERCHANT_VIEW
    )
    expect(SCREENS.MERCHANT_TERMINAL.actions.update).toBe(
      PERMISSION.TERMINAL_UPDATE
    )
  })

  it('mọi mã quyền trong registry đều lấy từ bảng permission-codes', () => {
    const declared = new Set<string>(Object.values(PERMISSION))
    for (const screen of screens) {
      for (const code of Object.values(screen.actions)) {
        expect(declared.has(code)).toBe(true)
      }
      if (screen.accessPermission) {
        expect(declared.has(screen.accessPermission)).toBe(true)
      }
    }
  })

  it('mọi route transaction-management yêu cầu TRANSACTION:FULL', () => {
    const transactionScreens = screens.filter(
      (screen) =>
        screen.path === SCREENS.TRANSACTION_MANAGEMENT.path ||
        screen.path.startsWith(`${SCREENS.TRANSACTION_MANAGEMENT.path}/`)
    )

    expect(transactionScreens.length).toBeGreaterThan(0)
    for (const screen of transactionScreens) {
      expect(screen.accessPermission).toBe(PERMISSION.TRANSACTION_FULL)
    }
    expect(
      findScreenByPath(
        `${SCREENS.TRANSACTION_MANAGEMENT.path}/refund-management`
      )
    ).toBe(SCREENS.TRANSACTION_MANAGEMENT)
  })

  it('mọi screen đều có đủ 6 action chuẩn', () => {
    for (const screen of screens) {
      if (screen === SCREENS.FEE_SCHEDULE) continue // Báo cáo chỉ đọc.
      for (const actionId of DEFAULT_SCREEN_ACTION_IDS) {
        expect(screen.actions[actionId]).toBeDefined()
      }
    }
  })
})

describe('findScreenByPath', () => {
  it('khớp chính xác và route con', () => {
    expect(findScreenByPath(SCREENS.USER_ACCOUNT.path)).toBe(
      SCREENS.USER_ACCOUNT
    )
    expect(findScreenByPath(`${SCREENS.FEE_POLICY.path}/edit/abc-123`)).toBe(
      SCREENS.FEE_POLICY
    )
  })

  it('không khớp nửa chừng một đoạn path', () => {
    expect(
      findScreenByPath(`${SCREENS.USER_ACCOUNT.path}-khac`)
    ).toBeUndefined()
  })

  it('alias trỏ về đúng màn', () => {
    expect(
      findScreenByPath(
        '/secure-panel/wallet-administration/transaction-wallet'
      )
    ).toBe(SCREENS.TRANSACTION_WALLET)
  })

  it('path ngoài registry trả về undefined', () => {
    expect(findScreenByPath('/secure-panel/forbidden')).toBeUndefined()
    expect(findScreenByPath('/')).toBeUndefined()
  })
})

describe('sidebar khớp registry', () => {
  it('mọi menu con trỏ tới ScreenId có thật và đúng path', () => {
    for (const group of navigationItems) {
      for (const child of group.children ?? []) {
        const screenId: ScreenId | undefined = child.screen
        expect(screenId).toBeDefined()
        if (!screenId) continue

        expect(child.link ?? `/${String(group.key)}/${String(child.key)}`).toBe(
          SCREENS[screenId].path
        )
      }
    }
  })
})
