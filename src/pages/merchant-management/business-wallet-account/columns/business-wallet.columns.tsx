import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'

import {
  EditOutlined,
  LockFilled,
  SnowflakeIcon,
  UnlockOutlined
} from '@components/icons'
import StatusBadge from '@components/status-badge/StatusBadge'
import { ButtonComponent, TooltipComponent, TypographyText } from '@components/index'
import { TYPEDATE } from '@constants/date.constant'
import { formatNumber } from '@utils/formatNumber'
import { Can } from '@/app/permissions'

import type { BusinessWalletRow } from '../types/business-wallet.type'

const statusConfig = {
  ACTIVE: {
    label: (
      <span className='flex items-center gap-1'>
        <UnlockOutlined aria-hidden /> Hoạt động
      </span>
    ),
    className: 'success-status'
  },
  INACTIVE: {
    label: 'Ngừng hoạt động',
    className: 'normal-status'
  },
  FROZEN: {
    label: (
      <span className='flex items-center gap-1'>
        <SnowflakeIcon aria-hidden size={13} /> Đóng băng
      </span>
    ),
    className: 'warning-status'
  },
  LOCKED: {
    label: (
      <span className='flex items-center gap-1'>
        <LockFilled aria-hidden /> Đã khóa
      </span>
    ),
    className: 'danger-status'
  }
}

const formatDateTime = (value: string): string => {
  const date = dayjs(value)
  return date.isValid() ? date.format(TYPEDATE.fullTime) : '--'
}

const renderAmount = (
  amount: number,
  currency: string,
  emphasize = false
) => (
  <span
    className={
      emphasize && amount > 0
        ? 'whitespace-nowrap font-medium text-danger tabular-nums'
        : 'whitespace-nowrap font-medium text-foreground tabular-nums'
    }
  >
    {formatNumber(amount)} <span className='text-xs text-muted-foreground'>{currency}</span>
  </span>
)

interface CreateBusinessWalletColumnsOptions {
  onEdit: (row: BusinessWalletRow) => void
}

export const createBusinessWalletColumns = ({
  onEdit
}: CreateBusinessWalletColumnsOptions): ColumnType<BusinessWalletRow>[] => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 56
  },
  {
    title: 'Doanh nghiệp / Mã chủ ví',
    width: 200,
    render: (_, record) => {
      const ownerName = record.ownerUsername || '--'
      return (
        <div className='flex min-w-0 flex-col gap-1'>
          <TooltipComponent title={ownerName}>
            <span className='truncate font-semibold text-foreground'>
              {ownerName}
            </span>
          </TooltipComponent>
          {record.ownerId ? (
            <TooltipComponent title={record.ownerId}>
              <TypographyText
                copyable={{ text: record.ownerId }}
                className='inline-flex max-w-full cursor-pointer text-xs! text-muted-foreground!'
              >
                <span className='truncate'>{record.ownerId}</span>
              </TypographyText>
            </TooltipComponent>
          ) : (
            <span className='text-xs text-muted-foreground'>--</span>
          )}
        </div>
      )
    }
  },
  {
    title: 'Tài khoản kế toán',
    width: 150,
    render: (_, record) => (
      <div className='flex flex-col gap-1'>
        <span className='font-medium text-foreground'>Ví doanh nghiệp</span>
        <span className='text-xs text-muted-foreground'>{record.glCode || '--'}</span>
      </div>
    )
  },
  {
    title: 'Số dư ví',
    align: 'right',
    width: 135,
    render: (_, record) => renderAmount(record.balance, record.currency)
  },
  {
    title: 'Số dư khả dụng',
    align: 'right',
    width: 135,
    render: (_, record) => renderAmount(record.availableBalance, record.currency)
  },
  {
    title: 'Số tiền đóng băng',
    align: 'right',
    width: 135,
    render: (_, record) => renderAmount(record.holdBalance, record.currency, true)
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
    title: 'Thời gian tạo',
    dataIndex: 'createdAt',
    align: 'center',
    width: 150,
    render: (value: string) => (
      <span className='whitespace-nowrap tabular-nums'>{formatDateTime(value)}</span>
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 90,
    render: (_, record) => (
      <Can screen='BUSINESS_WALLET_ACCOUNT' action='edit'>
        <TooltipComponent title='Sửa hồ sơ'>
          <ButtonComponent
            htmlType='button'
            type='text'
            aria-label='Sửa hồ sơ ví doanh nghiệp'
            icon={<EditOutlined aria-hidden />}
            onClick={() => onEdit(record)}
          />
        </TooltipComponent>
      </Can>
    )
  }
]
