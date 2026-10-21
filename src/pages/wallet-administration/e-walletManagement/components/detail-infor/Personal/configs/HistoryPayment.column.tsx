import StatusBadge from '@components/status-badge/StatusBadge'
import { ColumnType } from 'antd/es/table'
import React from 'react'
import {
  StatusKey,
  TransactionEnum,
  TransactionLabel,
  STATUS_CONFIG,
  BankLabel,
  BankEnum,
  PaymentMethodLabel,
  PaymentMethodEnum
} from '../types/HistoryPayment.type'
import dayjs from 'dayjs'
import { TagComponent } from '@components/index'
import { TypographyText, personalFlowColumns } from '@components/index'
import { UnifiedContentJournal } from '@type/apiResponseJournal'
import { cn } from '@utils/cn'

export const getColumn = (
  partyId?: string
): ColumnType<UnifiedContentJournal>[] => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 60
  },
  {
    title: 'Mã giao dịch',
    dataIndex: 'transactionCode',
    align: 'center',
    render: (value) => (
      <TypographyText
        copyable={{ text: value }}
        strong
        style={{ color: '#595959' }}
      >
        {value}
      </TypographyText>
    )
  },
  {
    title: 'Loại giao dịch',
    dataIndex: 'transactionType',
    align: 'center',
    render: (value) => {
      const typesColor: Record<string, string> = {
        TRANSFER: 'blue',
        P2P_TRANSFER: 'cyan',
        WITHDRAW: 'red',
        DEPOSIT: 'green',
        CASH_OUT: 'red',
        CASH_IN: 'green'
      }
      return (
        <TagComponent
          color={typesColor[value as TransactionEnum] || 'default'}
          style={{ margin: 0, fontWeight: 500 }}
        >
          {TransactionLabel[value as TransactionEnum]}
        </TagComponent>
      )
    }
  },

  {
    title: 'Người nhận',
    align: 'center',
    dataIndex: 'to',
    render: (value) => (
      <span className='font-medium text-gray-500'>
        {value?.type === 'BANK'
          ? `${BankLabel[value?.displayName as BankEnum]}  ${value?.username ? `- ${value?.username}` : ''}`
          : value?.username}
      </span>
    )
  },
  {
    title: 'Phương thức thanh toán',
    dataIndex: 'paymentMethod',
    align: 'center',
    render: (value) => {
      const methodColors: Record<string, string> = {
        ATM: 'blue',
        CC: 'purple',
        VA: 'orange',
        QR_CODE: 'cyan',
        WALLET_BALANCE: 'green',
        LINKED_ACCOUNT: 'geekblue'
      }
      return (
        <TagComponent
          color={methodColors[value as PaymentMethodEnum] || 'default'}
          style={{ margin: 0, fontWeight: 500 }}
        >
          {PaymentMethodLabel[value as PaymentMethodEnum] || '--'}
        </TagComponent>
      )
    }
  },
  ...personalFlowColumns<UnifiedContentJournal>(partyId),
  {
    title: 'Thời gian',
    align: 'center',
    render: (_, record) => (
      <div className='text-start'>
        <p className='text-gray-500'>
          Tạo: {dayjs.utc(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}
        </p>
        {record.postedAt && (
          <p className='text-[12px] text-green-600'>
            TC: {dayjs.utc(record.postedAt).format('DD/MM/YYYY HH:mm:ss')}
          </p>
        )}
      </div>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    align: 'center',
    render: (value) => (
      <StatusBadge
        className={cn(value === 'PENDING' ? 'animate-pulse-soft' : '')}
        status={value as StatusKey}
        config={STATUS_CONFIG}
      />
    )
  }
]
