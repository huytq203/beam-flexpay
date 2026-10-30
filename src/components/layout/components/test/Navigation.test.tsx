import { describe, expect, it } from 'vitest'
import { PERMISSION, SCREENS, grantsScreenAccess } from '@/app/permissions'
import {
  navigationItems,
  resolveNavLink,
  type ItemTypeCustom
} from '../Navigation'

const findItem = (
  items: ItemTypeCustom[],
  key: string
): ItemTypeCustom | undefined =>
  items.flatMap((item) => item.children ?? []).find((item) => item.key === key)

describe('merchant gateway navigation', () => {
  it('trỏ ba mục cấu hình tới screen registry tương ứng', () => {
    expect(findItem(navigationItems, 'key-connection')?.screen).toBe(
      'MERCHANT_KEY_CONNECTION'
    )
    expect(findItem(navigationItems, 'payment-method')?.screen).toBe(
      'MERCHANT_PAYMENT_METHOD'
    )
    expect(findItem(navigationItems, 'notification')?.screen).toBe(
      'MERCHANT_NOTIFICATION'
    )
  })

  it('có mục Giao dịch trong nhóm cổng ĐVCNTT', () => {
    expect(findItem(navigationItems, 'transaction')?.screen).toBe(
      'MERCHANT_TRANSACTION'
    )
  })

  it('tách quyết toán, hạn mức, tạm giữ, đối soát sang group riêng', () => {
    const sub = navigationItems.find(
      (item) => item.key === 'sub-merchant-management'
    )
    const settlement = navigationItems.find(
      (item) => item.key === 'settlement-management'
    )

    expect(sub?.children?.map((item) => item.key)).toEqual([
      'sub-merchant',
      'terminal'
    ])
    expect(settlement?.children?.map((item) => item.key)).toEqual([
      'settlement-config',
      'settlement-scope',
      'settlement-item',
      'withdrawal-limit',
      'hold-rule',
      'reconciliation',
      'balance-report'
    ])
  })

  it('không còn mục Webhook riêng và mục Gán Sales phụ trách', () => {
    expect(findItem(navigationItems, 'webhook')).toBeUndefined()
    expect(findItem(navigationItems, 'sales-assignment')).toBeUndefined()
  })
})

describe('quản lý hoàn tiền navigation', () => {
  it('trỏ mục Quản lý hoàn tiền tới đúng screen và đường dẫn route', () => {
    const parent = navigationItems.find((item) =>
      item.children?.some((child) => child.key === 'refund-management')
    )
    const item = findItem(navigationItems, 'refund-management')

    expect(item?.screen).toBe('REFUND_MANAGEMENT')
    expect(
      parent && item && `/${resolveNavLink(parent, item).replace(/^\//, '')}`
    ).toBe(SCREENS.REFUND_MANAGEMENT.path)
  })
})

describe('cấu hình phí ĐVCNTT navigation', () => {
  it('là nhóm riêng ngay sau Quản lý ĐVCNTT, mục con Cấu hình phí đầu vào trỏ tới MERCHANT_FEE_CONFIG', () => {
    const groupKeys = navigationItems.map((item) => item.key)
    const parent = navigationItems.find(
      (item) => item.key === 'merchant-fee-management'
    )
    const item = parent?.children?.[0]

    expect(groupKeys.indexOf('merchant-fee-management')).toBe(
      groupKeys.indexOf('secure-panel/merchant') + 1
    )
    expect(parent?.groupLabel).toBe('Nhóm quản lý cổng ĐVCNTT')
    expect(parent?.label).toBe('Cấu hình phí ĐVCNTT')
    expect(parent?.children).toHaveLength(1)
    expect(item?.key).toBe('fee-config')
    expect(item?.screen).toBe('MERCHANT_FEE_CONFIG')
    expect(item?.label).toBe('Cấu hình phí đầu vào')
    expect(
      parent && item && `/${resolveNavLink(parent, item).replace(/^\//, '')}`
    ).toBe('/secure-panel/merchant/fee-config')
    expect(SCREENS.MERCHANT_FEE_CONFIG.path).toBe(
      '/secure-panel/merchant/fee-config'
    )
  })

  it('không còn nằm trong nhóm Quản lý ĐVCNTT', () => {
    const merchant = navigationItems.find(
      (item) => item.key === 'secure-panel/merchant'
    )
    expect(merchant?.children?.map((item) => item.key)).not.toContain(
      'fee-config'
    )
  })
})

describe('ký quỹ ĐVCNTT navigation', () => {
  it('section Ký quỹ nằm ngay sau Quyết toán & đối soát, mục escrow trỏ MERCHANT_ESCROW', () => {
    const keys = navigationItems.map((item) => item.key)
    const section = navigationItems.find((item) => item.label === 'Ký quỹ')
    const item = findItem(navigationItems, 'escrow')

    expect(section?.groupLabel).toBe('Nhóm quản lý cổng ĐVCNTT')
    expect(keys.indexOf(section?.key ?? '')).toBe(
      keys.indexOf('settlement-management') + 1
    )
    expect(item?.screen).toBe('MERCHANT_ESCROW')
    expect(item?.label).toBe('Danh sách ký quỹ')
  })

  it('hiện khi có EWALLET:MERCHANT_ESCROW:VIEW, ẩn khi không có', () => {
    const screen = SCREENS[findItem(navigationItems, 'escrow')!.screen!]
    expect(grantsScreenAccess([PERMISSION.MERCHANT_ESCROW_VIEW], screen)).toBe(
      true
    )
    expect(grantsScreenAccess([], screen)).toBe(false)
  })
})

describe('nhật ký hệ thống navigation', () => {
  // Nhật ký hệ thống tra cứu thao tác của mọi phân hệ nên đứng riêng ở cuối menu,
  // không nằm lẫn trong nhóm tài khoản (ngay dưới Quản trị ví cá nhân) như trước.
  it('là section cuối cùng của menu', () => {
    const last = navigationItems[navigationItems.length - 1]
    expect(last.children?.map((item) => item.key)).toEqual(['audit-log'])
    expect(last.groupLabel).toBe('Nhóm hệ thống')
  })

  it('không còn nằm trong section Quản lý tài khoản', () => {
    const account = navigationItems.find(
      (item) => item.label === 'Quản lý tài khoản'
    )
    expect(account?.children?.map((item) => item.key)).not.toContain(
      'audit-log'
    )
  })

  it('giữ nguyên URL và screen AUDIT_LOG', () => {
    const last = navigationItems[navigationItems.length - 1]
    const item = findItem(navigationItems, 'audit-log')
    expect(item?.screen).toBe('AUDIT_LOG')
    expect(resolveNavLink(last, item!)).toBe(SCREENS.AUDIT_LOG.path)
  })
})
