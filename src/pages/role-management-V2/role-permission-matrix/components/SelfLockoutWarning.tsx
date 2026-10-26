import { cn } from '@lib/utils/cn'
import type { SelfLockoutRisk } from '../utils/matrixCaller.utils'

interface Props {
  risk: Exclude<SelfLockoutRisk, 'none'>
  roleName: string
  confirming: boolean
}

/** PUT không chặn việc gỡ `ROLE_PERMISSION_MANAGE`; chỉ bước đồng bộ mới chặn. */
export function SelfLockoutWarning({ risk, roleName, confirming }: Props) {
  const text =
    risk === 'own-role'
      ? `Bạn đang giữ vai trò ${roleName}. Gỡ quyền "Quản trị ma trận phân quyền" khỏi vai trò này có thể khiến bạn mất khả năng sửa lại ma trận sau lần đồng bộ kế tiếp, và không có cách khôi phục ngay trong ứng dụng.`
      : 'Gỡ quyền "Quản trị ma trận phân quyền" khỏi vai trò có thể khiến người đang giữ vai trò đó (có thể gồm cả bạn) mất khả năng sửa lại ma trận sau lần đồng bộ kế tiếp. Không xác định được vai trò của bạn từ phiên đăng nhập.'
  return (
    <p
      role='alert'
      className={cn(
        'rounded-md border p-3 text-xs',
        confirming
          ? 'border-danger bg-danger/10 text-danger-strong'
          : 'border-border bg-warning/10 text-warning-strong'
      )}
    >
      {text}
      {confirming && ' Nhấn "Vẫn lưu" để xác nhận.'}
    </p>
  )
}
