import type { MenuProps } from 'antd'
import { SCREENS, type ScreenActionId } from '@/app/permissions'
import type { AcountItem } from '../types/ResponseWalletAccount.type'
import { StatusKey } from '../types/WalletAccount.enum'

export type WalletModalType =
  | 'freeze'
  | 'unfreeze'
  | 'lock'
  | 'unlock'
  | null

interface WalletRowActionOptions {
  can: (action: ScreenActionId<'EWALLET_MANAGEMENT'>) => boolean
  navigate: (path: string) => void
  openModal?: (type: WalletModalType, account: AcountItem) => void
}

export const buildWalletRowActions = (
  record: AcountItem,
  { can, navigate, openModal }: WalletRowActionOptions
): MenuProps['items'] => {
  const items: MenuProps['items'] = []
  const isLocked = record.status === StatusKey.LOCKED
  const isFrozen = record.status === StatusKey.FROZEN
  const isSystem = record.ownerType === 'SYSTEM'
  const lockAction = isLocked ? 'unlock' : 'lock'

  if (can('viewDetail')) {
    items.push({
      key: '1',
      label: 'Xem chi tiết',
      onClick: () => navigate(`${SCREENS.EWALLET_MANAGEMENT.path}/${record.id}`)
    })
  }

  if (can(lockAction)) {
    items.push({
      key: '2',
      label: isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      onClick: () => openModal?.(isLocked ? 'unlock' : 'lock', record),
      disabled: isSystem || isFrozen
    })
  }

  if (can('freeze')) {
    items.push({
      key: '3',
      label: 'Đóng băng số dư',
      onClick: () => openModal?.('freeze', record),
      disabled: isSystem || (record.balance ?? 0) === 0
    })
  }

  if (can('cancel')) {
    items.push({ key: '5', label: 'Hủy ví', danger: true })
  }

  return items
}
