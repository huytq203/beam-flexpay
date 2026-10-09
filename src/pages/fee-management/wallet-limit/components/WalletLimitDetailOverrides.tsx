import type { TableProps } from 'antd'
import type { WalletLimitBankOverride } from '@type/walletLimit.type'
import { Table } from '@components/index'
import {
  LIMIT_FIELD_LABELS,
  PAYMENT_METHOD_LABELS,
  TRANSACTION_TYPE_LABELS
} from '../constants/walletLimit.constants'
import { formatLimitMoney } from '../utils/walletLimit.format'

type Columns = NonNullable<TableProps<WalletLimitBankOverride>['columns']>

interface WalletLimitDetailOverridesProps {
  overrides: WalletLimitBankOverride[]
}

type MoneyKey =
  | 'minPerTransaction'
  | 'maxPerTransaction'
  | 'dailyMaximum'
  | 'normalMonthlyMaximum'
  | 'specialMonthlyMaximum'

const MONEY_KEYS: MoneyKey[] = [
  'minPerTransaction',
  'maxPerTransaction',
  'dailyMaximum',
  'normalMonthlyMaximum',
  'specialMonthlyMaximum'
]

const COLUMNS: Columns = [
  {
    title: 'Loại GD',
    width: 140,
    render: (_, row) => TRANSACTION_TYPE_LABELS[row.transactionType]
  },
  {
    title: 'Ngân hàng / phương thức',
    width: 220,
    render: (_, row) =>
      [
        row.bankCode,
        row.paymentMethod && PAYMENT_METHOD_LABELS[row.paymentMethod]
      ]
        .filter(Boolean)
        .join(' · ')
  },
  ...MONEY_KEYS.map((key) => ({
    title: LIMIT_FIELD_LABELS[key],
    align: 'right' as const,
    className: 'tabular-nums',
    render: (_: unknown, row: WalletLimitBankOverride) =>
      formatLimitMoney(row[key])
  }))
]

const rowKey = (row: WalletLimitBankOverride): string =>
  row.id ?? [row.transactionType, row.bankCode, row.paymentMethod].join('|')

export function WalletLimitDetailOverrides({
  overrides
}: WalletLimitDetailOverridesProps) {
  if (overrides.length === 0) {
    return (
      <p className='text-xs text-muted-foreground'>
        Cấu hình này không có hạn mức riêng theo ngân hàng hoặc phương thức.
      </p>
    )
  }

  return (
    <Table<WalletLimitBankOverride>
      rowKey={rowKey}
      size='small'
      pagination={false}
      dataSource={overrides}
      columns={COLUMNS}
    />
  )
}
