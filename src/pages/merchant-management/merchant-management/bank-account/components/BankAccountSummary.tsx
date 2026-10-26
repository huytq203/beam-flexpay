import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { levelLabel } from '../constants/bankAccount.constants'
import { maskAccountNumber } from '../utils/bankAccount.utils'

interface BankAccountSummaryProps {
  row: BankAccountDto
}

const payableText = (row: BankAccountDto): string => {
  if (row.payable === undefined) return '—'
  return row.payable ? 'Có thể chi trả' : 'Không thể chi trả'
}

/** Tóm tắt tài khoản đang thao tác để người dùng không nhầm dòng. */
export function BankAccountSummary({ row }: BankAccountSummaryProps) {
  const items: [string, string][] = [
    ['Ngân hàng', row.bankCode],
    ['Số tài khoản', maskAccountNumber(row.accountNumber)],
    ['Chủ tài khoản', row.accountName],
    ['Cấp', levelLabel(row.level)],
    ['Chi trả', payableText(row)]
  ]

  return (
    <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-border p-3 text-sm'>
      {items.map(([label, value]) => (
        <div
          key={label}
          className='contents'
        >
          <dt className='text-xs text-muted-foreground'>{label}</dt>
          <dd className='min-w-0 truncate font-medium'>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
