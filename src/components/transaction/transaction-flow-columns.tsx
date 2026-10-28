import type { ColumnType } from 'antd/es/table'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import {
  buildPersonalFlow,
  buildTransactionFlow,
  resolveFeeDeduction,
  type PersonalFlow,
  type TransactionFlow
} from '@utils/transaction-flow'
import { MoneyCell, SplitFeeCell, type FlowTone } from './TransactionMoneyCell'

type FlowRecord = Parameters<typeof resolveFeeDeduction>[0] &
  Pick<UnifiedContentJournal, 'currency'>

const flowColumn = <T extends FlowRecord>(
  title: string,
  tone: FlowTone,
  pick: (flow: TransactionFlow) => number | null
): ColumnType<T> => ({
  title,
  align: 'right',
  render: (_, record) => (
    <MoneyCell
      amount={pick(buildTransactionFlow(record))}
      currency={record.currency}
      tone={tone}
    />
  )
})

const walletFeeColumn = <T extends FlowRecord>(): ColumnType<T> => ({
  title: 'Phí trừ ví',
  align: 'right',
  render: (_, record) => {
    const { walletFee, walletSplit } = resolveFeeDeduction(record)
    return walletSplit ? (
      <SplitFeeCell
        {...walletSplit}
        currency={record.currency}
      />
    ) : (
      <MoneyCell
        amount={walletFee}
        currency={record.currency}
        tone='fee'
      />
    )
  }
})

const bankFeeColumn = <T extends FlowRecord>(): ColumnType<T> => ({
  title: 'Phí trừ bank',
  align: 'right',
  render: (_, record) => (
    <MoneyCell
      amount={resolveFeeDeduction(record).bankFee}
      currency={record.currency}
      tone='fee'
    />
  )
})

/** 7 cột số tiền theo bảng nghiệp vụ "Lịch sử chung", dùng chung cho mọi danh sách giao dịch. */
export const transactionFlowColumns = <
  T extends FlowRecord
>(): ColumnType<T>[] => [
  flowColumn('Giá trị giao dịch', 'principal', (flow) => flow.principal),
  walletFeeColumn<T>(),
  bankFeeColumn<T>(),
  flowColumn(
    'Tổng tiền trừ ví',
    'negative',
    (flow) => flow.totals?.walletDebit ?? null
  ),
  flowColumn(
    'Tổng tiền cộng ví',
    'positive',
    (flow) => flow.totals?.walletCredit ?? null
  ),
  flowColumn(
    'Tổng tiền trừ bank',
    'negative',
    (flow) => flow.totals?.bankDebit ?? null
  ),
  flowColumn(
    'Tổng tiền cộng bank',
    'positive',
    (flow) => flow.totals?.bankCredit ?? null
  )
]

type PersonalRecord = FlowRecord & Pick<UnifiedContentJournal, 'to'>

const personalColumn = <T extends PersonalRecord>(
  title: string,
  tone: FlowTone,
  viewerId: string | null | undefined,
  pick: (flow: PersonalFlow) => number | null
): ColumnType<T> => ({
  title,
  align: 'right',
  render: (_, record) => {
    const flow = buildPersonalFlow(record, viewerId)
    return (
      <MoneyCell
        amount={pick(flow)}
        currency={record.currency}
        tone={tone}
      />
    )
  }
})

/** Lịch sử ví riêng: phí là phí của chủ ví đang xem, không tách người chuyển/nhận. */
export const personalFlowColumns = <T extends PersonalRecord>(
  viewerId: string | null | undefined
): ColumnType<T>[] => [
  personalColumn(
    'Giá trị giao dịch',
    'principal',
    viewerId,
    (f) => f.principal
  ),
  personalColumn('Phí trừ ví', 'fee', viewerId, (f) => f.walletFee),
  personalColumn('Phí trừ bank', 'fee', viewerId, (f) => f.bankFee),
  personalColumn(
    'Tổng tiền trừ ví',
    'negative',
    viewerId,
    (f) => f.totals?.walletDebit ?? null
  ),
  personalColumn(
    'Tổng tiền cộng ví',
    'positive',
    viewerId,
    (f) => f.totals?.walletCredit ?? null
  ),
  personalColumn(
    'Tổng tiền trừ bank',
    'negative',
    viewerId,
    (f) => f.totals?.bankDebit ?? null
  ),
  personalColumn(
    'Tổng tiền cộng bank',
    'positive',
    viewerId,
    (f) => f.totals?.bankCredit ?? null
  )
]
