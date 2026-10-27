import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import {
  ButtonComponent,
  StuckTransactionUpdateAction,
  TooltipComponent,
  WithdrawDecisionAction
} from '@components/index'
import { ArrowCounterClockwiseIcon, SnowflakeIcon } from '@components/icons'
import {
  canShowRefundTransactionAction,
  getFreezeTransactionAction,
  isPendingApprovalTransaction,
  shouldHideStuckUpdateAction
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

/** Giao dịch rút tiền chỉ còn nút xử lý lệnh treo: không đóng băng, không hoàn tiền. */
const WITHDRAW_TRANSACTION_TYPE = 'CASH_OUT'

export function TransactionRowActions({
  record,
  canFreeze,
  canRefund,
  onFreeze,
  onRefund,
  isFreezeBusy
}: TransactionRowActionsProps) {
  const isWithdrawal = record.transactionType === WITHDRAW_TRANSACTION_TYPE
  const action = getFreezeTransactionAction(record)
  const freezeLabel = 'Đóng băng giao dịch (Freeze)'

  return (
    <div className='flex items-center justify-center gap-1'>
      {isWithdrawal && isPendingApprovalTransaction(record) && (
        <WithdrawDecisionAction transactionCode={record.transactionCode} />
      )}
      <StuckTransactionUpdateAction
        compact
        transactionCode={record.transactionCode}
        transactionType={record.transactionType}
        journalStatus={record.status}
        hidden={shouldHideStuckUpdateAction(record)}
      />
      {!isWithdrawal && canRefund && canShowRefundTransactionAction(record) && (
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
      {!isWithdrawal && canFreeze && action === 'freeze' && (
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
