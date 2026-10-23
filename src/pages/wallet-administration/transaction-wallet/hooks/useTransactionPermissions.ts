import { PERMISSION, useAccess } from '@/app/permissions'
import { useAppSelector } from '@hooks/hook'

export interface TransactionPermissions {
  /** Hoàn tiền, cập nhật treo, kiểm tra lại trạng thái: BE chỉ mở cho `EWALLET:FULL`. */
  canFull: boolean
  username: string
}

export const useTransactionPermissions = (): TransactionPermissions => {
  const { has } = useAccess()
  const username = useAppSelector((state) => state.auth.profile.username)
  return {
    canFull: has(PERMISSION.EWALLET_FULL),
    username: username ?? ''
  }
}
