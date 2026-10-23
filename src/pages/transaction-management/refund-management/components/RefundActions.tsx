import {
  ArrowsCounterClockwiseIcon,
  BankIcon,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined
} from '@components/icons'
import { cn } from '@lib/utils/cn'
import type { RefundTarget } from '../schemas/refund.schema'
import { getSettleLabel, type RefundActionFlags } from '../utils/refund.utils'
import { RefundDecisionPopover } from './RefundDecisionPopover'
import { RefundActionButton } from './RefundActionButton'

interface RefundActionsProps {
  refund: RefundTarget
  flags: RefundActionFlags
  variant: 'icon' | 'text'
  onView?: (refund: RefundTarget) => void
  onApprove: (refund: RefundTarget) => void
  onReject: (refund: RefundTarget) => void
  onSettle: (refund: RefundTarget) => void
  onPayoutApprove: (refund: RefundTarget) => void
  onPayoutReject: (refund: RefundTarget) => void
  onPayoutRefresh: (refund: RefundTarget) => void
  isPayoutRefreshing?: boolean
}

export function RefundActions({
  refund,
  flags,
  variant,
  onView,
  onApprove,
  onReject,
  onSettle,
  onPayoutApprove,
  onPayoutReject,
  onPayoutRefresh,
  isPayoutRefreshing
}: RefundActionsProps) {
  const nameFor = (label: string): string | undefined =>
    variant === 'icon' ? `${label} ${refund.refundCode}` : undefined

  const isInline = variant === 'icon'
  // Dạng icon mở popover qua phần tử bọc ngoài, nên nút không tự mở dialog.
  const openOrNothing = (open: (target: RefundTarget) => void) =>
    isInline ? () => undefined : () => open(refund)

  const rejectButton = (
    <RefundActionButton
      variant={variant}
      tone='danger'
      label='Từ chối'
      ariaLabel={nameFor('Từ chối')}
      icon={<CloseOutlined aria-hidden />}
      onClick={() => onReject(refund)}
    />
  )
  const approveButton = (
    <RefundActionButton
      variant={variant}
      tone={isInline ? 'default' : 'primary'}
      label={isInline ? 'Duyệt / Từ chối' : 'Duyệt'}
      ariaLabel={nameFor('Duyệt')}
      icon={<CheckOutlined aria-hidden />}
      onClick={openOrNothing(onApprove)}
    />
  )

  const payoutRejectButton = (
    <RefundActionButton
      variant={variant}
      tone='danger'
      label='Từ chối chi'
      ariaLabel={nameFor('Từ chối chi')}
      icon={<CloseOutlined aria-hidden />}
      onClick={() => onPayoutReject(refund)}
    />
  )
  const payoutApproveButton = (
    <RefundActionButton
      variant={variant}
      tone={isInline ? 'default' : 'primary'}
      label={isInline ? 'Duyệt chi / Từ chối chi' : 'Duyệt chi'}
      ariaLabel={nameFor('Duyệt chi')}
      icon={<BankIcon aria-hidden />}
      onClick={isInline ? () => undefined : () => onPayoutApprove(refund)}
    />
  )

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        variant === 'icon'
          ? 'flex-nowrap justify-center'
          : 'flex-wrap justify-end'
      )}
    >
      {onView && (
        <RefundActionButton
          variant='icon'
          label={`Xem chi tiết ${refund.refundCode}`}
          icon={<EyeOutlined aria-hidden />}
          onClick={() => onView(refund)}
        />
      )}
      {flags.decide &&
        (isInline ? (
          <RefundDecisionPopover refund={refund}>
            {approveButton}
          </RefundDecisionPopover>
        ) : (
          <>
            {rejectButton}
            {approveButton}
          </>
        ))}
      {flags.payoutDecide &&
        (isInline ? (
          <RefundDecisionPopover
            mode='payout'
            refund={refund}
          >
            {payoutApproveButton}
          </RefundDecisionPopover>
        ) : (
          <>
            {payoutRejectButton}
            {payoutApproveButton}
          </>
        ))}
      {flags.settle && (
        <RefundActionButton
          variant={variant}
          label={getSettleLabel(refund)}
          ariaLabel={nameFor(getSettleLabel(refund))}
          icon={<BankIcon aria-hidden />}
          onClick={() => onSettle(refund)}
        />
      )}
      {flags.payoutRefresh && (
        <RefundActionButton
          variant={variant}
          label='Làm mới lệnh chi'
          ariaLabel={nameFor('Làm mới lệnh chi')}
          icon={<ArrowsCounterClockwiseIcon aria-hidden />}
          loading={isPayoutRefreshing}
          onClick={() => onPayoutRefresh(refund)}
        />
      )}
    </div>
  )
}
