import { describe, expect, it } from 'vitest'
import {
  navigationItems,
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
})
