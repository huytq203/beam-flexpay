import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import type { ColumnsType } from 'antd/es/table'
import { amountColumns } from './transactionAmount.columns'
import { infoColumns } from './transactionInfo.columns'
import {
  RefundedAmountCell,
  TransactionStatusCell
} from './TransactionRefundCells'
import { TransactionRowActions } from './TransactionRowActions'

interface ColumnProps {
  canFreeze: boolean
  canRefund: boolean
  onFreeze: (transaction: UnifiedContentJournal) => void
  onRefund: (transaction: UnifiedContentJournal) => void
  onUnfreeze: (transaction: UnifiedContentJournal) => void
  openingFreezeTransactionId?: string
  openingUnfreezeTransactionId?: string
}

const getColumn = ({
  canFreeze,
  canRefund,
  onFreeze,
  onRefund,
  onUnfreeze,
  openingFreezeTransactionId,
  openingUnfreezeTransactionId
}: ColumnProps): ColumnsType<UnifiedContentJournal> => [
  ...infoColumns,
  ...amountColumns,
  {
    title: 'Số tiền đã hoàn',
    align: 'right',
    width: 170,
    render: (_, record) => <RefundedAmountCell record={record} />
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    align: 'center',
    width: 210,
    render: (_, record) => <TransactionStatusCell record={record} />
  },
  {
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 140,
    render: (_, record) => (
      <TransactionRowActions
        record={record}
        canFreeze={canFreeze}
        canRefund={canRefund}
        onFreeze={onFreeze}
        onRefund={onRefund}
        isFreezeBusy={
          openingFreezeTransactionId === record.transactionId ||
          openingUnfreezeTransactionId === record.transactionId
        }
      />
    )
  }
]
export default getColumn
