import { DrawerComponent, ButtonComponent } from '@components/index'
import { RefundStatusBadge } from '@components/status-badge/RefundStatusBadge'
import { SkeletonText } from '@components/ui/skeletons/Skeleton'
import { useGetRefundDetailQuery } from '@services/apiRefund'
import type { RefundTarget } from '../schemas/refund.schema'
import {
  getDisplayStatus,
  getRefundActions,
  getRefundErrorText,
  type RefundActionContext
} from '../utils/refund.utils'
import { RefundActions } from './RefundActions'
import { RefundAmountSection } from './RefundAmountSection'
import { RefundDetailAlerts } from './RefundDetailAlerts'
import {
  RefundBeneficiarySection,
  RefundHistorySection,
  RefundInfoSection
} from './RefundInfoSections'
import { RefundNote } from './RefundNote'

interface RefundDetailDrawerProps {
  refundId: string
  context: RefundActionContext
  canViewFullAccountNumber: boolean
  isPayoutRefreshing: boolean
  onClose: () => void
  onApprove: (refund: RefundTarget) => void
  onReject: (refund: RefundTarget) => void
  onSettle: (refund: RefundTarget) => void
  onPayoutRefresh: (refund: RefundTarget) => void
  onPayoutApprove: (refund: RefundTarget) => void
  onPayoutReject: (refund: RefundTarget) => void
}

export function RefundDetailDrawer({
  refundId,
  context,
  canViewFullAccountNumber,
  isPayoutRefreshing,
  onClose,
  onApprove,
  onReject,
  onSettle,
  onPayoutRefresh,
  onPayoutApprove,
  onPayoutReject
}: RefundDetailDrawerProps) {
  const { data, isLoading, error, refetch } = useGetRefundDetailQuery(refundId)
  const flags = data ? getRefundActions(data, context) : undefined
  const hasFooter = Boolean(
    flags &&
      (flags.decide ||
        flags.payoutDecide ||
        flags.settle ||
        flags.payoutRefresh)
  )

  const renderBody = () => {
    if (isLoading) return <SkeletonText lines={8} />
    if (error) {
      return (
        <div className='flex flex-col items-start gap-3'>
          <RefundNote tone='danger'>{getRefundErrorText(error)}</RefundNote>
          <ButtonComponent
            type='default'
            content='Thử lại'
            onClick={() => void refetch()}
          />
        </div>
      )
    }
    if (!data || !flags) {
      return (
        <p className='text-sm text-muted-foreground'>
          Không tìm thấy yêu cầu hoàn tiền.
        </p>
      )
    }
    return (
      <div className='flex flex-col gap-6'>
        <RefundDetailAlerts
          refund={data}
          flags={flags}
          canApprove={context.canApprove}
        />
        <RefundInfoSection refund={data} />
        <RefundAmountSection refund={data} />
        <RefundBeneficiarySection
          refund={data}
          canViewFullAccountNumber={canViewFullAccountNumber}
        />
        <RefundHistorySection refund={data} />
      </div>
    )
  }

  return (
    <DrawerComponent
      open
      onClose={onClose}
      width='min(100vw, 560px)'
      title={
        <div className='flex flex-col items-start gap-1'>
          <span>{data?.refundCode ?? 'Chi tiết hoàn tiền'}</span>
          {data && <RefundStatusBadge status={getDisplayStatus(data)} />}
        </div>
      }
      footer={
        data && flags && hasFooter ? (
          <RefundActions
            refund={data}
            flags={flags}
            variant='text'
            onApprove={onApprove}
            onReject={onReject}
            onSettle={onSettle}
            onPayoutRefresh={onPayoutRefresh}
            onPayoutApprove={onPayoutApprove}
            onPayoutReject={onPayoutReject}
            isPayoutRefreshing={isPayoutRefreshing}
          />
        ) : undefined
      }
    >
      {renderBody()}
    </DrawerComponent>
  )
}
