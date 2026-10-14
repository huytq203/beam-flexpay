import { useScreenAccess } from '@/app/permissions'
import type { FeePolicyScheduleAction } from '@type/fee.type'

/**
 * Quyền hẹn giờ lấy đúng quyền của nút bấm tay tương ứng: mở chính sách như
 * nút Kích hoạt (`activate`), khóa như nút Ngừng áp dụng (`deactivate`).
 */
export const useSchedulePermissions = (): {
  allowedActions: FeePolicyScheduleAction[]
  canSchedule: boolean
  can: (action: FeePolicyScheduleAction) => boolean
} => {
  const { can } = useScreenAccess('FEE_CONFIG')
  const allowed = (action: FeePolicyScheduleAction): boolean =>
    action === 'ACTIVATE' ? can('activate') : can('deactivate')
  const allowedActions = (['ACTIVATE', 'DEACTIVATE'] as const).filter(allowed)
  return {
    allowedActions,
    canSchedule: allowedActions.length > 0,
    can: allowed
  }
}
