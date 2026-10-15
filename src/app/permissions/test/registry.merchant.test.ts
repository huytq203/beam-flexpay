import { describe, expect, it } from 'vitest'
import { PERMISSION, SCREENS } from '@/app/permissions'

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
})
