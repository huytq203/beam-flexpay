import type { TableProps } from 'antd'
import StatusBadge from '@components/status-badge/StatusBadge'
import { ButtonComponent, DrawerComponent, Table } from '@components/index'
import { useGetTransactionDetail360Query } from '@services/apiJournal'
import type {
  MoneyFlowEntry,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import { CONFIG_STATUS } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { formatAccountingAccount } from '@pages/wallet-administration/transaction-wallet/utils/accountingAccountLabel'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { formatNumber } from '@utils/index'
import { MERCHANT_TRANSACTION_METHOD_LABELS } from '../constants/merchantTransaction.constants'

interface MerchantTransactionDetailDrawerProps {
  transaction: UnifiedContentJournal | null
  onClose: () => void
}

interface InfoRow {
  label: string
  value: string
}

const money = (value: number, currency: string): string =>
  `${formatNumber(value)} ${currency}`

const flowColumns: NonNullable<TableProps<MoneyFlowEntry>['columns']> = [
  { title: 'Bước', dataIndex: 'sequence', width: 64 },
  {
    title: 'Nợ',
    render: (_v, row) => formatAccountingAccount(row.debitAccount)
  },
  {
    title: 'Có',
    render: (_v, row) => formatAccountingAccount(row.creditAccount)
  },
  {
    title: 'Số tiền',
    align: 'right',
    render: (_v, row) => (
      <span className='whitespace-nowrap tabular-nums'>
        {formatNumber(row.amount)}
      </span>
    )
  }
]

const buildInfoRows = (transaction: UnifiedContentJournal): InfoRow[] => [
  {
    label: 'Phương thức',
    value:
      MERCHANT_TRANSACTION_METHOD_LABELS[transaction.paymentMethod] ??
      (transaction.paymentMethod || '--')
  },
  {
    label: 'Bên chuyển',
    value: transaction.from?.displayName || transaction.from?.username || '--'
  },
  {
    label: 'Bên nhận',
    value: transaction.to?.displayName || transaction.to?.username || '--'
  },
  { label: 'Mã tham chiếu NH', value: transaction.bankRefId || '--' },
  {
    label: 'Thời gian tạo',
    value: formatUTCToLocalDateTime(transaction.createdAt) || '--'
  },
  {
    label: 'Thời gian thành công',
    value: formatUTCToLocalDateTime(transaction.postedAt) || '--'
  },
  {
    label: 'Số tiền gốc',
    value: money(transaction.amount, transaction.currency)
  },
  { label: 'Phí', value: money(transaction.feeAmount, transaction.currency) },
  { label: 'Tổng', value: money(transaction.grossAmount, transaction.currency) }
]

function InfoList({ rows }: { rows: InfoRow[] }) {
  return (
    <dl className='grid grid-cols-[140px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm'>
      {rows.map((row) => (
        <div
          key={row.label}
          className='contents'
        >
          <dt className='text-muted-foreground'>{row.label}</dt>
          <dd className='break-words text-foreground'>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function MerchantTransactionDetailDrawer({
  transaction,
  onClose
}: MerchantTransactionDetailDrawerProps) {
  const detail = useGetTransactionDetail360Query(transaction?.id ?? '', {
    skip: !transaction
  })
  const current = detail.data?.transaction ?? transaction

  return (
    <DrawerComponent
      open={Boolean(transaction)}
      width={480}
      title={transaction?.transactionCode || transaction?.journalCode}
      onClose={onClose}
      destroyOnHidden
    >
      {current && (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <p className='text-2xl font-bold tabular-nums text-foreground'>
              {money(current.amount, current.currency)}
            </p>
            <StatusBadge
              status={current.status}
              config={CONFIG_STATUS}
            />
            {current.failureReason && (
              <p
                role='alert'
                className='rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-strong'
              >
                {current.failureReason}
              </p>
            )}
          </div>
          <InfoList rows={buildInfoRows(current)} />
          <h3 className='font-display text-sm font-semibold text-foreground'>
            Dòng tiền
          </h3>
          {detail.isError ? (
            <div
              role='alert'
              className='flex items-center justify-between gap-2 text-sm text-danger-strong'
            >
              Không thể tải dòng tiền.
              <ButtonComponent
                type='default'
                size='small'
                content='Thử lại'
                onClick={() => void detail.refetch()}
              />
            </div>
          ) : (
            <Table<MoneyFlowEntry>
              rowKey='sequence'
              size='small'
              pagination={false}
              loading={detail.isFetching}
              dataSource={detail.data?.moneyFlow ?? []}
              columns={flowColumns}
              locale={{ emptyText: 'Chưa ghi sổ' }}
            />
          )}
        </div>
      )}
    </DrawerComponent>
  )
}
