import { Can } from '@/app/permissions'
import {
  ArrowsCounterClockwiseIcon,
  BankIcon,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined
} from '@components/icons'
import type { RefundTarget } from '../schemas/refund.schema'
import { getSettleLabel, type RefundActionFlags } from '../utils/refund.utils'
import { RefundActionButton } from './RefundActionButton'

interface RefundActionsProps {
  refund: RefundTarget
  flags: RefundActionFlags
  variant: 'icon' | 'text'
  onView?: (refund: RefundTarget) => void
  onApprove: (refund: RefundTarget) => void
  onReject: (refund: RefundTarget) => void
  onSettle: (refund: RefundTarget) => void
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
  onPayoutRefresh,
  isPayoutRefreshing
}: RefundActionsProps) {
  const nameFor = (label: string): string | undefined =>
    variant === 'icon' ? `${label} ${refund.refundCode}` : undefined

  return (
    <div className='flex flex-wrap items-center justify-end gap-2'>
      {onView && (
        <Can
          screen='REFUND_MANAGEMENT'
          action='viewDetail'
        >
          <RefundActionButton
            variant='icon'
            label={`Xem chi tiết ${refund.refundCode}`}
            icon={<EyeOutlined aria-hidden />}
            onClick={() => onView(refund)}
          />
        </Can>
      )}
      {flags.decide && (
        <>
          <RefundActionButton
            variant={variant}
            tone='danger'
            label='Từ chối'
            ariaLabel={nameFor('Từ chối')}
            icon={<CloseOutlined aria-hidden />}
            onClick={() => onReject(refund)}
          />
          <RefundActionButton
            variant={variant}
            tone='primary'
            label='Duyệt'
            ariaLabel={nameFor('Duyệt')}
            icon={<CheckOutlined aria-hidden />}
            onClick={() => onApprove(refund)}
          />
        </>
      )}
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
