import type { TableProps } from 'antd'
import StatusBadge from '@components/status-badge/StatusBadge'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { CONFIG_STATUS } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { formatNumber } from '@utils/index'
import {
  MERCHANT_TRANSACTION_METHOD_LABELS,
  MERCHANT_TRANSACTION_TYPE_OPTIONS
} from '../constants/merchantTransaction.constants'
import { getRowNumber } from '../utils/merchantTransaction.utils'

type Columns = NonNullable<TableProps<UnifiedContentJournal>['columns']>

interface MerchantTransactionColumnOptions {
  page: number
  size: number
  onOpenDetail: (transaction: UnifiedContentJournal) => void
}

const typeLabel = (value: string): string =>
  MERCHANT_TRANSACTION_TYPE_OPTIONS.find((item) => item.value === value)
    ?.label ?? value

const money = (value: number, currency: string): string =>
  `${formatNumber(value)} ${currency}`

export const createMerchantTransactionColumns = ({
  page,
  size,
  onOpenDetail
}: MerchantTransactionColumnOptions): Columns => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _record, index) => getRowNumber(page, size, index)
  },
  {
    title: 'Mã giao dịch',
    width: 170,
    render: (_value, record) => (
      <button
        type='button'
        className='font-mono text-xs font-semibold text-foreground underline decoration-primary underline-offset-4'
        onClick={() => onOpenDetail(record)}
      >
        {record.transactionCode || record.journalCode}
      </button>
    )
  },
  {
    title: 'Loại giao dịch',
    width: 140,
    render: (_value, record) => typeLabel(record.transactionType)
  },
  {
    title: 'Phương thức',
    width: 150,
    render: (_value, record) =>
      MERCHANT_TRANSACTION_METHOD_LABELS[record.paymentMethod] ??
      (record.paymentMethod || '--')
  },
  {
    title: 'Bên chuyển',
    width: 160,
    render: (_value, record) =>
      record.from?.displayName || record.from?.username || '--'
  },
  {
    title: 'Bên nhận',
    width: 160,
    render: (_value, record) =>
      record.to?.displayName || record.to?.username || '--'
  },
  {
    title: 'Số tiền',
    align: 'right',
    width: 160,
    render: (_value, record) => (
      <span className='whitespace-nowrap font-medium tabular-nums'>
        {money(record.amount, record.currency)}
      </span>
    )
  },
  {
    title: 'Phí',
    align: 'right',
    width: 130,
    render: (_value, record) => (
      <span className='whitespace-nowrap tabular-nums text-muted-foreground'>
        {money(record.feeAmount, record.currency)}
      </span>
    )
  },
  {
    title: 'Trạng thái',
    align: 'center',
    width: 140,
    render: (_value, record) => (
      <StatusBadge
        status={record.status}
        config={CONFIG_STATUS}
      />
    )
  },
  {
    title: 'Thời gian tạo',
    align: 'right',
    width: 170,
    render: (_value, record) => (
      <span className='whitespace-nowrap tabular-nums'>
        {formatUTCToLocalDateTime(record.createdAt)}
      </span>
    )
  }
]
