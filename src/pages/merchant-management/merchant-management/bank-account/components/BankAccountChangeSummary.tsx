import type {
  BankAccountChangeRequest,
  BankAccountDto
} from '@/app/services/merchantBankAccountApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  CHANGE_TYPE_LABEL,
  levelLabel
} from '../constants/bankAccount.constants'

interface BankAccountChangeSummaryProps {
  row: BankAccountDto
  change: BankAccountChangeRequest
}

interface Line {
  label: string
  current: string
  proposed: string
}

const proposedLines = (
  row: BankAccountDto,
  change: BankAccountChangeRequest
): Line[] =>
  [
    {
      label: 'Ngân hàng',
      current: row.bankCode,
      proposed: change.proposedBankCode
    },
    {
      label: 'Số tài khoản',
      current: row.accountNumber,
      proposed: change.proposedAccountNumber
    },
    {
      label: 'Chủ tài khoản',
      current: row.accountName,
      proposed: change.proposedAccountName
    },
    {
      label: 'Chi nhánh',
      current: row.branchName ?? '—',
      proposed: change.proposedBranchName
    }
  ].flatMap(({ label, current, proposed }) =>
    proposed ? [{ label, current, proposed }] : []
  )

/** Nội dung yêu cầu đang chờ: người duyệt cần đối chiếu giá trị cũ và mới. */
export function BankAccountChangeSummary({
  row,
  change
}: BankAccountChangeSummaryProps) {
  const lines = proposedLines(row, change)

  return (
    <section className='flex flex-col gap-2 rounded-lg border border-border p-3 text-sm'>
      <h3 className='font-medium'>{CHANGE_TYPE_LABEL[change.changeType]}</h3>
      {change.changeType === 'SET_DEFAULT' && (
        <p>Đặt tài khoản này làm mặc định của {levelLabel(row.level)}.</p>
      )}
      {lines.length > 0 && (
        <table className='w-full text-left text-xs'>
          <thead className='text-muted-foreground'>
            <tr>
              <th className='py-1 font-normal'>Thông tin</th>
              <th className='py-1 font-normal'>Hiện tại</th>
              <th className='py-1 font-normal'>Đề xuất</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.label}>
                <td className='py-1'>{line.label}</td>
                <td className='py-1 font-mono'>{line.current}</td>
                <td className='py-1 font-mono font-medium'>{line.proposed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className='text-xs text-muted-foreground'>
        Gửi lúc {formatUTCToLocalDateTime(change.createdAt) || '—'}
        {change.requestReason ? ` · Lý do: ${change.requestReason}` : ''}
      </p>
    </section>
  )
}
