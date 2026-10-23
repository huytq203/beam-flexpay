import { useScreenAccess } from '@/app/permissions'
import { useAppSelector } from '@hooks/hook'
import type { RefundActionContext } from '../utils/refund.utils'

export interface RefundPermissions extends RefundActionContext {
  canViewFullAccountNumber: boolean
}

export const useRefundPermissions = (): RefundPermissions => {
  const { can } = useScreenAccess('REFUND_MANAGEMENT')
  const username = useAppSelector((state) => state.auth.profile.username)

  return {
    username: username ?? '',
    canApprove: can('approve') && can('reject'),
    canPayoutApprove: can('payoutApprove') && can('payoutReject'),
    canSettle: can('settle'),
    canPayoutRefresh: can('payoutRefresh'),
    canViewFullAccountNumber: can('full')
  }
}
