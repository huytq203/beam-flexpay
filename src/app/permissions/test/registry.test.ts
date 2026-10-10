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
    expect(SCREENS.USER_ACCOUNT.actions.assignRoles).toBe(
      PERMISSION.USER_UPDATE
    )
    expect(SCREENS.CONFIRM_EKYC.actions.view).toBe(PERMISSION.ADMIN_FULL)
    expect(SCREENS.CONFIRM_EKYC.actions.approve).toBe(PERMISSION.ADMIN_FULL)
  })

  it('phân quyền duyệt KYB ví và duyệt Merchant theo hai API riêng', () => {
    expect(SCREENS.BUSINESS_WALLET_ACCOUNT.actions.approve).toBe(
      PERMISSION.ENTERPRISE_WALLET_KYB_APPROVE
    )
    expect(SCREENS.MERCHANT_MANAGEMENT.actions.approve).toBe(
      PERMISSION.MERCHANT_API_APPROVE
    )
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

  it('khai báo màn Giao dịch merchant dùng chung quyền giao dịch', () => {
    expect(SCREENS.MERCHANT_TRANSACTION.path).toBe(
      '/secure-panel/merchant/transaction'
    )
    expect(SCREENS.MERCHANT_TRANSACTION.actions.view).toBe(
      PERMISSION.TRANSACTION_VIEW
    )
  })

  it('đăng ký hai màn Sub-merchant và Terminal bằng quyền API riêng', () => {
    expect(SCREENS.MERCHANT_SUB_MERCHANT.path).toBe(
      '/secure-panel/merchant/sub-merchant'
    )
    expect(SCREENS.MERCHANT_TERMINAL.path).toBe(
      '/secure-panel/merchant/terminal'
    )
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
        screen !== SCREENS.REFUND_MANAGEMENT &&
        (screen.path === SCREENS.TRANSACTION_MANAGEMENT.path ||
          screen.path.startsWith(`${SCREENS.TRANSACTION_MANAGEMENT.path}/`))
    )

    expect(transactionScreens.length).toBeGreaterThan(0)
    for (const screen of transactionScreens) {
      expect(screen.accessPermission).toBe(PERMISSION.TRANSACTION_FULL)
    }
  })

  it('hoàn tiền tự khai quyền: xem/duyệt/từ chối cho REFUND:APPROVE, chi tiền chỉ EWALLET:FULL', () => {
    const refund = SCREENS.REFUND_MANAGEMENT
    expect(findScreenByPath(refund.path)).toBe(refund)
    expect('accessPermission' in refund).toBe(false)
    for (const action of ['view', 'viewDetail', 'approve', 'reject'] as const) {
      expect(refund.actions[action]).toBe(PERMISSION.REFUND_APPROVE)
    }
    for (const action of [
      'settle',
      'payoutRefresh',
      'create',
      'full'
    ] as const) {
      expect(refund.actions[action]).toBe(PERMISSION.EWALLET_FULL)
    }
  })

  it('lịch sử giao dịch thêm action review (TRANSACTION:REVIEW) và giữ nguyên các action cũ', () => {
    const wallet = SCREENS.TRANSACTION_WALLET
    expect(wallet.actions.review).toBe(PERMISSION.TRANSACTION_REVIEW)
    expect(PERMISSION.TRANSACTION_REVIEW).toBe('EWALLET:TRANSACTION:REVIEW')
    expect(wallet.accessPermission).toBe(PERMISSION.TRANSACTION_FULL)
    expect(wallet.actions.viewDetail).toBe(PERMISSION.TRANSACTION_VIEW)
    expect(wallet.actions.full).toBe(PERMISSION.TRANSACTION_FULL)
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
      findScreenByPath('/secure-panel/wallet-administration/transaction-wallet')
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
