import { describe, expect, it, vi } from 'vitest'
import type { ScreenActionId } from '@/app/permissions'
import type { AcountItem } from '../../types/ResponseWalletAccount.type'
import { buildWalletRowActions } from '../wallet-row-actions'

const account = {
  id: 'wallet-1',
  status: 'ACTIVE',
  ownerType: 'USER',
  balance: 1_000
} as unknown as AcountItem

const actionKeys = (
  allowed: readonly ScreenActionId<'EWALLET_MANAGEMENT'>[]
): string[] => {
  const actions = buildWalletRowActions(account, {
    can: (action) => allowed.includes(action),
    navigate: vi.fn(),
    openModal: vi.fn()
  })

  return (actions ?? []).map((item) => String(item?.key))
}

describe('buildWalletRowActions', () => {
  it('chỉ tạo menu tương ứng quyền được cấp', () => {
    expect(actionKeys(['viewDetail', 'freeze'])).toEqual(['1', '3'])
  })

  it('tạo đầy đủ menu khi có mọi quyền', () => {
    expect(actionKeys(['viewDetail', 'lock', 'freeze', 'cancel'])).toEqual([
      '1',
      '2',
      '3',
      '5'
    ])
  })
})
