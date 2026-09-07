import type { ColumnType } from 'antd/es/table'

import { Can } from '@/app/permissions'
import { EditOutlined, LockFilled, LockKeyOpenIcon } from '@components/icons'
import { ButtonComponent, TooltipComponent, TypographyText } from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import { cn } from '@utils/cn'

import { BankAccountNumberCell } from '../components/BankAccountNumberCell'
import { ScopeTag } from '../components/ScopeTag'
import {
  describeWithdraw,
  LINK_STATUS_LABEL,
  STATUS_LABEL
} from '../constants/bank-account.constant'
import {
  BankAccountStatus,
  WithdrawMode,
  type BankAccountRow
} from '../types/bank-account.type'

const statusConfig = {
  [BankAccountStatus.ACTIVE]: {
    label: STATUS_LABEL.ACTIVE,
    className: 'success-status'
  },
  [BankAccountStatus.INACTIVE]: {
    label: STATUS_LABEL.INACTIVE,
    className: 'normal-status'
  }
}

const linkStatusConfig = {
  LINKED: { label: LINK_STATUS_LABEL.LINKED, className: 'success-status' },
  PENDING: { label: LINK_STATUS_LABEL.PENDING, className: 'warning-status' },
  FAILED: { label: LINK_STATUS_LABEL.FAILED, className: 'danger-status' }
}

interface CreateBankAccountColumnsOptions {
  onEdit: (row: BankAccountRow) => void
  onToggleLock: (row: BankAccountRow) => void
}

export const createBankAccountColumns = ({
  onEdit,
  onToggleLock
}: CreateBankAccountColumnsOptions): ColumnType<BankAccountRow>[] => [
  {
    title: 'Cấp áp dụng',
    width: 220,
    render: (_, record) => (
      <div className='flex min-w-0 flex-col gap-1'>
        <ScopeTag scope={record.scope} />
        <TooltipComponent title={record.merchantName}>
          <span className='truncate font-semibold text-foreground'>
            {record.merchantName}
          </span>
        </TooltipComponent>
        <TypographyText
          copyable={{ text: record.merchantCode }}
          className='inline-flex max-w-full cursor-pointer text-xs! text-muted-foreground!'
        >
          <span className='truncate'>{record.merchantCode}</span>
        </TypographyText>
      </div>
    )
  },
  {
    title: 'Ngân hàng',
    dataIndex: 'bankName',
    width: 150,
    render: (value: string, record) => (
      <div className='flex flex-col gap-0.5'>
        <span className='font-medium text-foreground'>{value}</span>
        {record.branchName ? (
          <span className='text-xs text-muted-foreground'>
            {record.branchName}
          </span>
        ) : null}
      </div>
    )
  },
  {
    title: 'Số tài khoản',
    width: 170,
    render: (_, record) => (
      <BankAccountNumberCell
        accountNumber={record.accountNumber}
        ownerLabel={record.merchantName}
      />
    )
  },
  {
    title: 'Chủ tài khoản',
    dataIndex: 'accountName',
    width: 200,
    render: (value: string) => (
      <TooltipComponent title={value}>
        <span className='block truncate text-foreground'>{value}</span>
      </TooltipComponent>
    )
  },
  {
    title: 'Hình thức rút',
    width: 140,
    render: (_, record) => (
      <span
        className={cn(
          'w-fit rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
          record.withdrawMode === WithdrawMode.AUTO
            ? 'bg-primary/10 text-secondary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {describeWithdraw(record)}
      </span>
    )
  },
  {
    title: 'Trạng thái',
    align: 'center',
    width: 120,
    render: (_, record) => (
      <StatusBadge status={record.status} config={statusConfig} />
    )
  },
  {
    title: 'Liên kết',
    align: 'center',
    width: 145,
    render: (_, record) => (
      <StatusBadge status={record.linkStatus} config={linkStatusConfig} />
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: (_, record) => {
      const isActive = record.status === BankAccountStatus.ACTIVE
      const lockLabel = isActive ? 'Khóa' : 'Mở khóa'

      return (
        <div className='flex items-center justify-center gap-1'>
          <Can screen='MERCHANT_BANK_ACCOUNT' action='edit'>
            <TooltipComponent title='Sửa tài khoản'>
              <ButtonComponent
                htmlType='button'
                type='text'
                aria-label={`Sửa tài khoản ngân hàng của ${record.merchantName}`}
                icon={<EditOutlined aria-hidden />}
                onClick={() => onEdit(record)}
              />
            </TooltipComponent>
          </Can>
          <Can screen='MERCHANT_BANK_ACCOUNT' action='lock'>
            <TooltipComponent title={`${lockLabel} tài khoản`}>
              <ButtonComponent
                htmlType='button'
                type='text'
                danger={isActive}
                aria-label={`${lockLabel} tài khoản ngân hàng của ${record.merchantName}`}
                icon={
                  isActive ? (
                    <LockFilled aria-hidden />
                  ) : (
                    <LockKeyOpenIcon aria-hidden size={16} />
                  )
                }
                onClick={() => onToggleLock(record)}
              />
            </TooltipComponent>
          </Can>
        </div>
      )
    }
  }
]
