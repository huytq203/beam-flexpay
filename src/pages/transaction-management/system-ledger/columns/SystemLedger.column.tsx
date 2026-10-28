import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import WalletLink from '@components/wallet-link/WalletLink'
import { MaskText, TooltipComponent, TypographyText } from '@components/index'
import { formatNumber } from '@utils/formatNumber'
import {
  DirectionConstants,
  GLCodeLabels,
  getLedgerTransactionTypeLabel
} from '../constants/SystemLedger.constant'
import type { LedgerRow } from '../utils/groupLedgerByJournal'

const EMPTY = <span className='text-muted-foreground'>--</span>

const renderTransaction = (record: LedgerRow) => {
  if (!record.isJournalStart) return null
  const code = record.transaction?.transactionCode
  if (!code) return EMPTY
  const id = record.transaction?.id
  const type = record.transactionType

  return (
    <div className='flex flex-col gap-0.5'>
      <span className='font-semibold text-foreground'>{code}</span>
      {type && (
        <span className='text-xs text-secondary-foreground'>
          {getLedgerTransactionTypeLabel(type)}
        </span>
      )}
      {id && (
        <TooltipComponent title={id}>
          <span className='inline-flex max-w-45 items-center gap-1 text-xs text-muted-foreground'>
            <span className='truncate'>{id}</span>
            <TypographyText copyable={{ text: id }} />
          </span>
        </TooltipComponent>
      )}
    </div>
  )
}

const renderJournalCode = (record: LedgerRow) => {
  if (!record.isJournalStart) return null
  const value = record.journalCode
  if (!value) return EMPTY
  return (
    <span className='inline-flex items-center gap-1 font-medium whitespace-nowrap'>
      {value}
      <TypographyText copyable={{ text: value }} />
    </span>
  )
}

const renderAccount = (record: LedgerRow) => {
  const walletId = record.account?.id
  if (record.account?.ownerType === 'SYSTEM') {
    return (
      <WalletLink walletId={walletId}>
        <span className='font-semibold'>Hệ thống</span>
      </WalletLink>
    )
  }
  const username = record.account?.ownerUsername
  if (!username) return EMPTY
  // BE có lúc đã che sẵn; che thêm lần nữa sẽ làm hỏng chuỗi.
  if (username.includes('*')) {
    return (
      <WalletLink walletId={walletId}>
        <span className='font-medium tabular-nums'>{username}</span>
      </WalletLink>
    )
  }
  return (
    <WalletLink walletId={walletId}>
      <MaskText
        value={username}
        className='tabular-nums'
      />
    </WalletLink>
  )
}

/** Một cột cho mỗi chiều, như sổ kế toán: không dấu +/-, không tô màu theo chiều. */
const amountColumn = (
  title: string,
  direction: LedgerRow['direction']
): ColumnsType<LedgerRow>[number] => ({
  title,
  key: direction,
  align: 'right',
  width: 140,
  render: (_, record) =>
    record.direction === direction ? (
      <span className='font-semibold whitespace-nowrap tabular-nums'>
        {formatNumber(record.amount)}
      </span>
    ) : null
})

export const systemLedgerColumns: ColumnsType<LedgerRow> = [
  { title: '#', dataIndex: 'no', align: 'center', width: 50 },
  {
    title: 'Giao dịch',
    key: 'transaction',
    width: 200,
    render: (_, record) => renderTransaction(record)
  },
  {
    title: 'Mã bút toán',
    key: 'journalCode',
    width: 190,
    render: (_, record) => renderJournalCode(record)
  },
  {
    title: 'Vai trò',
    key: 'role',
    width: 130,
    render(_, record) {
      return (
        <span className='rounded-sm border border-border px-2 py-0.5 text-xs whitespace-nowrap'>
          {record.role}
        </span>
      )
    }
  },
  {
    title: 'Tài khoản (Ví)',
    key: 'account',
    width: 150,
    render: (_, record) => renderAccount(record)
  },
  {
    title: 'Loại tài khoản',
    key: 'glCode',
    width: 220,
    render(_, record) {
      const ownerType = record.account?.ownerType
      const glCode = record.account?.glCode
      return (
        <div className='flex flex-col gap-0.5 text-xs'>
          <span className='font-medium'>
            {(glCode && GLCodeLabels[glCode]) ?? ownerType ?? '--'}
          </span>
          <span className='text-muted-foreground'>
            {[ownerType, glCode].filter(Boolean).join(' · ')}
          </span>
        </div>
      )
    }
  },
  amountColumn('Nợ (₫)', DirectionConstants.DEBIT),
  amountColumn('Có (₫)', DirectionConstants.CREDIT),
  {
    title: 'Số dư sau GD (₫)',
    dataIndex: 'balanceAfter',
    align: 'right',
    width: 150,
    render: (value: number) => (
      <span className='whitespace-nowrap tabular-nums'>
        {formatNumber(value)}
      </span>
    )
  },
  // Không có cột Trạng thái: dòng sổ cái chỉ sinh ra khi bút toán đã hạch toán
  // thành công, nên cột này luôn mang đúng một giá trị.
  {
    title: 'Thời gian ghi sổ',
    key: 'createdAt',
    width: 160,
    render: (_, record) => (
      <span className='text-xs whitespace-nowrap text-muted-foreground tabular-nums'>
        {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}
      </span>
    )
  }
]
