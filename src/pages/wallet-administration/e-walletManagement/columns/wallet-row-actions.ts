import type { MenuProps } from 'antd'
import { SCREENS, type ScreenActionId } from '@/app/permissions'
import type { AcountItem } from '../types/ResponseWalletAccount.type'
import { StatusKey } from '../types/WalletAccount.enum'

export type WalletModalType =
  | 'freeze'
  | 'unfreeze'
  | 'lock'
  | 'unlock'
  | 'unlockLogin'
  | null

interface WalletRowActionOptions {
  can: (action: ScreenActionId<'EWALLET_MANAGEMENT'>) => boolean
  onViewDetail: (account: AcountItem) => void
  openModal?: (type: WalletModalType, account: AcountItem) => void
}

interface WalletDetailRequest {
  unwrap: () => Promise<unknown>
}

interface OpenWalletDetailOptions {
  loadAccountById: (
    id: string,
    preferCacheValue?: boolean
  ) => WalletDetailRequest
  navigate: (path: string) => void
}

export const preloadWalletDetailAndNavigate = async (
  account: AcountItem,
  { loadAccountById, navigate }: OpenWalletDetailOptions
): Promise<void> => {
  await loadAccountById(account.id, false).unwrap()
  navigate(`${SCREENS.EWALLET_MANAGEMENT.path}/${account.id}`)
}

export const buildWalletRowActions = (
  record: AcountItem,
  { can, onViewDetail, openModal }: WalletRowActionOptions
): MenuProps['items'] => {
  const items: MenuProps['items'] = []
  const isSystem = record.ownerType === 'SYSTEM'

  if (isSystem) return items

  const isLocked = record.status === StatusKey.LOCKED
  const isFrozen = record.status === StatusKey.FROZEN
  const lockAction = isLocked ? 'unlock' : 'lock'

  if (can('viewDetail')) {
    items.push({
      key: '1',
      label: 'Xem chi tiết',
      onClick: () => onViewDetail(record)
    })
  }

  if (can(lockAction)) {
    items.push({
      key: '2',
      label: isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      onClick: () => openModal?.(isLocked ? 'unlock' : 'lock', record),
      disabled: isFrozen
    })
  }

  // Chỉ ẩn khi biết chắc tài khoản đang đăng nhập được (false); null/undefined vẫn cho mở khóa.
  if (can('unlockLogin') && record.loginLocked !== false) {
    items.push({
      key: '4',
      label: 'Mở khóa đăng nhập',
      onClick: () => openModal?.('unlockLogin', record)
    })
  }

  if (can('freeze')) {
    items.push({
      key: '3',
      label: 'Đóng băng số dư',
      onClick: () => openModal?.('freeze', record),
      disabled: (record.balance ?? 0) === 0
    })
  }

  if (can('cancel')) {
    items.push({ key: '5', label: 'Hủy ví', danger: true })
  }

  return items
}
