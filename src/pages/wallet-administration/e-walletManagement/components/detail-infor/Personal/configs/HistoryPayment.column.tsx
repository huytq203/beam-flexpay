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
  PaymentMethodEnum,
  SourceDomainLabel,
  SourceDomain
} from '../types/HistoryPayment.type'
import dayjs from 'dayjs'
import { formatNumber } from '@utils/formatNumber'
import { TagComponent } from '@components/index'
import { TypographyText } from '@components/index'
import { UnifiedContentJournal } from '@type/apiResponseJournal'
import { cn } from '@utils/cn'

export const getColumn = (): ColumnType<UnifiedContentJournal>[] => [
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
    title: 'Số tiền gốc',
    align: 'right',
    render(value, record) {
      return (
        <div className='text-right font-medium'>
          <p>{formatNumber(record.amount) + ' ' + record.currency}</p>
        </div>
      )
    }
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
  {
    title: 'Nguồn',
    dataIndex: 'sourceDomain',
    align: 'center',
    render: (value) => {
      const sourceColors: Record<string, string> = {
        EWALLET: 'gold'
      }
      return (
        <TagComponent
          color={sourceColors[value as SourceDomain] || 'default'}
          style={{ margin: 0, fontWeight: 500 }}
        >
          {SourceDomainLabel[value as SourceDomain] || '--'}
        </TagComponent>
      )
    }
  },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    align: 'right',
    render: (value, record) => (
      <TypographyText
        strong
        style={{ color: '#2bd9d0', fontSize: '15px' }}
      >
        {formatNumber(value)}{' '}
        <TypographyText
          type='secondary'
          style={{ fontSize: '12px' }}
        >
          {record?.currency || 'VND'}
        </TypographyText>
      </TypographyText>
    )
  },
  {
    title: 'Phí giao dịch',
    dataIndex: 'feeAmount',
    align: 'right',
    render: (value, record) => (
      <TypographyText
        type='danger'
        strong
      >
        {formatNumber(value)}{' '}
        <TypographyText
          type='secondary'
          style={{ fontSize: '12px' }}
        >
          {record?.currency || 'VND'}
        </TypographyText>
      </TypographyText>
    )
  },
  {
    title: 'Tổng số tiền',
    dataIndex: 'grossAmount',
    align: 'right',
    render: (value, record) => (
      <TypographyText strong>
        {formatNumber(value)}{' '}
        <TypographyText
          type='secondary'
          style={{ fontSize: '12px' }}
        >
          {record?.currency || 'VND'}
        </TypographyText>
      </TypographyText>
    )
  },

  {
    title: 'Thời gian tạo',
    dataIndex: 'createdAt',
    align: 'center',
    render: (value) => (
      <TypographyText type='secondary'>
        {dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss')}
      </TypographyText>
    )
  },
  // {
  //     title: 'Thời gian giao dịch',
  //     dataIndex: 'transactionTime',
  //     align: 'center',
  //     render: (value) => <TypographyText type="secondary">{dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss')}</TypographyText>
  // },
  {
    title: 'Thời gian thành công',
    dataIndex: 'postedAt',
    align: 'center',
    render: (value) => (
      <TypographyText type='secondary'>
        {dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss')}
      </TypographyText>
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
