import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import {
  ButtonComponent,
  StuckTransactionUpdateAction,
  TooltipComponent
} from '@components/index'
import { ArrowCounterClockwiseIcon, SnowflakeIcon } from '@components/icons'
import {
  canShowRefundTransactionAction,
  getFreezeTransactionAction,
  isPendingApprovalTransaction
} from './transaction-row-actions'

export interface TransactionRowActionsProps {
  record: UnifiedContentJournal
  canFreeze: boolean
  /** `EWALLET:FULL`: tạo yêu cầu hoàn tiền. */
  canRefund: boolean
  onFreeze: (transaction: UnifiedContentJournal) => void
  onRefund: (transaction: UnifiedContentJournal) => void
  isFreezeBusy: boolean
}

const REFUND_LABEL = 'Hoàn tiền'

export function TransactionRowActions({
  record,
  canFreeze,
  canRefund,
  onFreeze,
  onRefund,
  isFreezeBusy
}: TransactionRowActionsProps) {
  const action = getFreezeTransactionAction(record)
  const freezeLabel = 'Đóng băng giao dịch (Freeze)'

  return (
    <div className='flex items-center justify-center gap-1'>
      <StuckTransactionUpdateAction
        compact
        transactionCode={record.transactionCode}
        transactionType={record.transactionType}
        journalStatus={record.status}
        hidden={isPendingApprovalTransaction(record)}
      />
      {canRefund && canShowRefundTransactionAction(record) && (
        <TooltipComponent title={REFUND_LABEL}>
          <ButtonComponent
            aria-label={REFUND_LABEL}
            htmlType='button'
            type='default'
            size='small'
            icon={
              <ArrowCounterClockwiseIcon
                size={17}
                weight='regular'
              />
            }
            onClick={() => onRefund(record)}
          />
        </TooltipComponent>
      )}
      {canFreeze && action === 'freeze' && (
        <TooltipComponent title={freezeLabel}>
          <ButtonComponent
            aria-label={freezeLabel}
            htmlType='button'
            type='default'
            size='small'
            loading={isFreezeBusy}
            icon={
              <SnowflakeIcon
                size={17}
                weight='regular'
                className='text-cyan-700'
                aria-hidden
              />
            }
            onClick={() => onFreeze(record)}
          />
        </TooltipComponent>
      )}
    </div>
  )
}
