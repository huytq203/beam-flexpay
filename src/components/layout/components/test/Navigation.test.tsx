import { describe, expect, it } from 'vitest'
import { SCREENS } from '@/app/permissions'
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

  it('hiển thị group quản lý sub-merchant kèm cấu hình quyết toán và hạn mức rút', () => {
    const group = navigationItems.find(
      (item) => item.key === 'sub-merchant-management'
    )

    expect(group?.label).toBe('Quản lý sub-merchant')
    expect(group?.children?.map((item) => item.key)).toEqual([
      'sub-merchant',
      'terminal',
      'settlement-config',
      'settlement-scope',
      'settlement-item',
      'withdrawal-limit',
      'hold-rule',
      'reconciliation',
      'balance-report'
    ])
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
