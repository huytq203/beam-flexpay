import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  LINK_STATUS,
  STATUS_OPTIONS,
  levelLabel
} from '../constants/bankAccount.constants'
import { maskAccountNumber } from '../utils/bankAccount.utils'

interface BankAccountDetailFieldsProps {
  account: BankAccountDto
  merchantName: (id?: string) => string
}

const yesNo = (value?: boolean | null): string => {
  if (value === undefined || value === null) return '—'
  return value ? 'Có' : 'Không'
}

const dateText = (value?: string | null): string =>
  (value && formatUTCToLocalDateTime(value)) || '—'

const statusText = (status: BankAccountDto['status']): string =>
  STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status

const payableText = (payable?: boolean): string => {
  if (payable === undefined) return '—'
  return payable ? 'Có thể chi trả' : 'Không thể chi trả'
}

const toItems = (
  account: BankAccountDto,
  merchantName: BankAccountDetailFieldsProps['merchantName']
): [string, string][] => [
  ['Merchant', merchantName(account.owningMerchantId ?? account.merchantId)],
  ['Sub-merchant', account.subMerchantId ?? '—'],
  ['Cấp', levelLabel(account.level)],
  ['Ngân hàng', account.bankCode],
  ['Số tài khoản', maskAccountNumber(account.accountNumber)],
  ['Chủ tài khoản', account.accountName],
  ['Chi nhánh', account.branchName || '—'],
  ['Tài khoản mặc định', yesNo(account.isDefault)],
  ['Cho phép tên chủ TK khác pháp nhân', yesNo(account.holderNameExempt)],
  ['Trạng thái', statusText(account.status)],
  ['Liên kết', LINK_STATUS[account.linkStatus]?.label ?? account.linkStatus],
  ['Lý do lỗi liên kết', account.linkFailureReason || '—'],
  ['Chi trả', payableText(account.payable)],
  ['Tạm giữ', yesNo(account.holdMode)],
  ['Lý do tạm giữ', account.holdModeReason || '—'],
  ['Thời điểm đổi tạm giữ', dateText(account.holdModeChangedAt)],
  ['Ngày tạo', dateText(account.createdAt)],
  ['Cập nhật lần cuối', dateText(account.updatedAt)]
]

/** Toàn bộ thông tin tài khoản lấy từ API chi tiết, hiển thị dạng nhãn - giá trị. */
export function BankAccountDetailFields({
  account,
  merchantName
}: BankAccountDetailFieldsProps) {
  return (
    <dl className='grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]'>
      {toItems(account, merchantName).map(([label, value]) => (
        <div
          key={label}
          className='contents'
        >
          <dt className='text-xs text-muted-foreground sm:text-sm'>{label}</dt>
          <dd className='min-w-0 break-words font-medium'>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
