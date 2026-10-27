import type { ColumnsType } from 'antd/es/table'
import { Can } from '@/app/permissions'
import type { BankAccountChangeRequestItem } from '@/app/services/merchantBankAccountApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, TagComponent } from '@components/index'
import type { BankAccountDecisionType } from '../components/BankAccountDecisionDialog'
import { CHANGE_TYPE_LABEL } from '../constants/bankAccount.constants'
import {
  CHANGE_REQUEST_STATUS_COLOR,
  CHANGE_REQUEST_STATUS_OPTIONS
} from '../constants/bankAccountChangeRequest.constants'
import { maskAccountNumber } from '../utils/bankAccount.utils'

interface Options {
  page: number
  size: number
  /** JWT subject của người đang đăng nhập; BE so với `requestedBy`. */
  currentUserId: string
  onDecide: (
    type: BankAccountDecisionType,
    row: BankAccountChangeRequestItem
  ) => void
}

const dash = (value?: string | null): string => value || '—'

const accountCell = (
  bankCode?: string | null,
  accountNumber?: string | null,
  accountName?: string | null
) =>
  bankCode || accountNumber || accountName ? (
    <div className='space-y-0.5 text-xs'>
      <div className='font-medium'>
        {dash(bankCode)} ·{' '}
        {accountNumber ? maskAccountNumber(accountNumber) : '—'}
      </div>
      <div className='text-muted-foreground'>{dash(accountName)}</div>
    </div>
  ) : (
    '—'
  )

export const createBankAccountChangeRequestColumns = ({
  page,
  size,
  currentUserId,
  onDecide
}: Options): ColumnsType<BankAccountChangeRequestItem> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => (page - 1) * size + index + 1
  },
  {
    title: 'Merchant',
    width: 180,
    render: (_, row) => dash(row.merchantName)
  },
  {
    title: 'Sub-merchant',
    width: 180,
    render: (_, row) => dash(row.subMerchantName)
  },
  {
    title: 'Loại thay đổi',
    width: 190,
    render: (_, row) => CHANGE_TYPE_LABEL[row.changeType] ?? row.changeType
  },
  {
    title: 'Hiện tại',
    width: 200,
    render: (_, row) =>
      accountCell(
        row.currentBankCode,
        row.currentAccountNumber,
        row.currentAccountName
      )
  },
  {
    title: 'Đề xuất',
    width: 200,
    render: (_, row) =>
      row.changeType === 'SET_DEFAULT'
        ? 'Đặt làm mặc định'
        : accountCell(
            row.proposedBankCode,
            row.proposedAccountNumber,
            row.proposedAccountName
          )
  },
  {
    title: 'Người đề xuất',
    width: 220,
    render: (_, row) => (
      <div className='space-y-0.5 text-xs'>
        <div>{dash(row.requestedByName)}</div>
        <div className='text-muted-foreground'>
          {formatUTCToLocalDateTime(row.createdAt) || '—'}
        </div>
        {row.requestReason && <div>Lý do: {row.requestReason}</div>}
      </div>
    )
  },
  {
    title: 'Trạng thái',
    width: 120,
    render: (_, row) => (
      <TagComponent color={CHANGE_REQUEST_STATUS_COLOR[row.status]}>
        {CHANGE_REQUEST_STATUS_OPTIONS.find((o) => o.value === row.status)
          ?.label ?? row.status}
      </TagComponent>
    )
  },
  {
    title: 'Quyết định',
    width: 220,
    render: (_, row) =>
      row.decidedBy || row.decidedAt ? (
        <div className='space-y-0.5 text-xs'>
          <div>{formatUTCToLocalDateTime(row.decidedAt ?? '') || '—'}</div>
          {row.decisionReason && <div>Lý do: {row.decisionReason}</div>}
        </div>
      ) : (
        '—'
      )
  },
  {
    title: 'Thao tác',
    fixed: 'right',
    width: 170,
    render: (_, row) => {
      if (row.status !== 'PENDING') return null
      // Người gửi yêu cầu không được tự duyệt (BE trả 403).
      if (row.requestedBy === currentUserId)
        return (
          <span className='text-xs text-muted-foreground'>
            Chờ người khác duyệt
          </span>
        )
      return (
        <Can
          screen='MERCHANT_BANK_ACCOUNT'
          action='approve'
        >
          <div className='flex justify-center gap-1'>
            <ButtonComponent
              size='small'
              type='primary'
              content='Phê duyệt'
              onClick={() => onDecide('approve', row)}
            />
            <ButtonComponent
              size='small'
              danger
              content='Từ chối'
              onClick={() => onDecide('reject', row)}
            />
          </div>
        </Can>
      )
    }
  }
]
