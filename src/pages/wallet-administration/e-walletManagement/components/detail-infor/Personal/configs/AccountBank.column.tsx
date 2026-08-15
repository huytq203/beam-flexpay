import type { BankLink } from '@services/apiBankLink'
import { ColumnType } from 'antd/es/table'
import React from 'react'
import {
  BANK_LINK_STATUS_CONFIG,
  BankEnum,
  BankLabel,
  LINK_TYPE_CONFIG,
  isActiveBankLinkStatus
} from '../constants/AccountBank.constant'
import {
  ButtonComponent,
  TooltipComponent,
  TypographyText
} from '@components/index'
import {
  PencilLineIcon,
  ShieldCheckIcon,
  XCircleIcon
} from '@components/icons'
import StatusBadge from '@components/status-badge/StatusBadge'
import dayjs from 'dayjs'

export type BankLinkTableRow = BankLink & { no: number }

export interface AccountBankColumnOptions {
  onUpdate?: (record: BankLink) => void
  onUnlink?: (record: BankLink) => void
  onApprove?: (record: BankLink) => void
}

const fallback = (value?: string | null) => value || '--'

const formatDateTime = (value?: string | null) => {
  if (!value) return '--'
  const date = dayjs(value)
  return date.isValid() ? date.format('DD/MM/YYYY HH:mm:ss') : '--'
}

export const getColumn = ({
  onUpdate,
  onUnlink,
  onApprove
}: AccountBankColumnOptions = {}): ColumnType<BankLinkTableRow>[] => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 64,
    fixed: 'left'
  },
  // {
  //   title: 'ID liên kết',
  //   dataIndex: 'id',
  //   render: fallback
  // },
  // {
  //   title: 'User ID',
  //   dataIndex: 'userId',
  //   render: fallback
  // },
   {
    title: 'Tài khoản',
    dataIndex: 'walletId',
    render: fallback
  },
  {
    title: 'Ngân hàng',
    dataIndex: 'bankCode',
    align: 'center',
    render: (value) => (
      <TypographyText>
        {BankLabel[value as BankEnum] ?? fallback(value)}
      </TypographyText>
    )
  },
  {
    title: 'Số tài khoản',
    dataIndex: 'accountNumberMask',
    align: 'center',
    render: fallback
  },
  {
    title: 'Số thẻ',
    dataIndex: 'cardNumberMask',
    align: 'center',
    render: fallback
  },
  {
    title: 'Tên tài khoản',
    dataIndex: 'accountName',
    render: fallback
  },
  {
    title: 'Loại liên kết',
    dataIndex: 'linkType',
    align: 'center',
    render: (value) => value ? (
      <StatusBadge
        status={value}
        config={LINK_TYPE_CONFIG}
      />
    ) : '--'
  },
  {
    title: 'Mặc định',
    dataIndex: 'isDefault',
    align: 'center',
    render: (value: boolean | null) => (
      value == null ? '--' : value ? 'Có' : 'Không'
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    align: 'center',
    render: (value) => value ? (
      <StatusBadge
        status={value}
        config={BANK_LINK_STATUS_CONFIG}
      />
    ) : '--'
  },
  {
    title: 'Thời gian liên kết',
    dataIndex: 'linkedAt',
    align: 'center',
    render: formatDateTime
  },
  {
    title: 'Thời gian hủy liên kết',
    dataIndex: 'unlinkedAt',
    align: 'center',
    render: formatDateTime
  },
  {
    title: 'Thao tác',
    key: 'actions',
    align: 'center',
    fixed: 'right',
    width: 132,
    render: (_, record) => (
      <div className='flex items-center justify-center gap-1'>
        <TooltipComponent title='Cập nhật liên kết'>
          <span className='inline-flex'>
            <ButtonComponent
              htmlType='button'
              type='default'
              size='small'
              aria-label='Cập nhật liên kết ngân hàng'
              icon={<PencilLineIcon size={17} />}
              disabled={!onUpdate}
              onClick={() => onUpdate?.(record)}
            />
          </span>
        </TooltipComponent>
        <TooltipComponent title={
          isActiveBankLinkStatus(record.status)
            ? 'Hủy liên kết'
            : 'Chỉ có thể hủy liên kết đang hoạt động'
        }>
          <span className='inline-flex'>
            <ButtonComponent
              htmlType='button'
              type='default'
              size='small'
              danger
              aria-label='Hủy liên kết ngân hàng'
              icon={<XCircleIcon size={17} />}
              disabled={!onUnlink || !isActiveBankLinkStatus(record.status)}
              onClick={() => onUnlink?.(record)}
            />
          </span>
        </TooltipComponent>
        <TooltipComponent title='Phê duyệt xác thực'>
          <span className='inline-flex'>
            <ButtonComponent
              htmlType='button'
              type='default'
              size='small'
              aria-label='Phê duyệt xác thực liên kết ngân hàng'
              icon={<ShieldCheckIcon size={17} />}
              disabled={!onApprove}
              onClick={() => onApprove?.(record)}
            />
          </span>
        </TooltipComponent>
      </div>
    )
  }
]
