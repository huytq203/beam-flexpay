import { useScreenAccess } from '@/app/permissions'
import { useAppSelector } from '@hooks/hook'
import type { RefundActionContext } from '../utils/refund.utils'

export interface RefundPermissions extends RefundActionContext {
  canViewFullAccountNumber: boolean
  /** Kế toán chỉ có `PAYOUT:APPROVE` vẫn xem được chi tiết. */
  canViewDetail: boolean
}

export const useRefundPermissions = (): RefundPermissions => {
  const { can } = useScreenAccess('REFUND_MANAGEMENT')
  const username = useAppSelector((state) => state.auth.profile.username)

  return {
    username: username ?? '',
    canApprove: can('approve') && can('reject'),
    canSettle: can('settle'),
    canPayoutRefresh: can('payoutRefresh'),
    canPayoutApprove: can('payoutApprove'),
    canViewDetail: can('viewDetail') || can('payoutApprove'),
    canViewFullAccountNumber: can('full')
  }
}
