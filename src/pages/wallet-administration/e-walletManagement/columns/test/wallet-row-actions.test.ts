import { describe, expect, it, vi } from 'vitest'
import type { ScreenActionId } from '@/app/permissions'
import type { AcountItem } from '../../types/ResponseWalletAccount.type'
import {
  buildWalletRowActions,
  preloadWalletDetailAndNavigate
} from '../wallet-row-actions'

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
    onViewDetail: vi.fn(),
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

  it('không tạo action cho tài khoản hệ thống', () => {
    const actions = buildWalletRowActions(
      { ...account, ownerType: 'SYSTEM' },
      {
        can: () => true,
        onViewDetail: vi.fn(),
        openModal: vi.fn()
      }
    )

    expect(actions).toEqual([])
  })

  it('chuyển bản ghi được chọn cho luồng tải chi tiết trước khi điều hướng', () => {
    const onViewDetail = vi.fn()
    const actions = buildWalletRowActions(account, {
      can: (action) => action === 'viewDetail',
      onViewDetail
    })

    const viewDetailAction = actions?.[0]
    if (!viewDetailAction || 'type' in viewDetailAction) {
      throw new Error('Không tìm thấy action xem chi tiết')
    }

    viewDetailAction.onClick?.({} as never)

    expect(onViewDetail).toHaveBeenCalledWith(account)
  })

  it('chỉ điều hướng sau khi API chi tiết hoàn tất', async () => {
    let resolveRequest: (() => void) | undefined
    const request = new Promise<void>((resolve) => {
      resolveRequest = resolve
    })
    const loadAccountById = vi.fn(() => ({ unwrap: () => request }))
    const navigate = vi.fn()

    const openDetail = preloadWalletDetailAndNavigate(account, {
      loadAccountById,
      navigate
    })

    expect(loadAccountById).toHaveBeenCalledWith(account.id, false)
    expect(navigate).not.toHaveBeenCalled()

    resolveRequest?.()
    await openDetail

    expect(navigate).toHaveBeenCalledWith(
      `/secure-panel/wallet-administration/e-walletManagement/${account.id}`
    )
  })
})
