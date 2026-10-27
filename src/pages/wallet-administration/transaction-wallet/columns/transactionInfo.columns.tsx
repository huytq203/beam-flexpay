import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { PartyCell } from './PartyCell'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import StatusBadge from '@components/status-badge/StatusBadge'
import { PATHS } from '@constants/pathConstant'
import {
  PaymentMethodEnum,
  SourceDomain,
  type TransactionKey
} from '../constants/Transaction.constant'
import {
  PAYMENT_METHOD_BADGE_CONFIG,
  SOURCE_DOMAIN_BADGE_CONFIG,
  TRANSACTION_TYPE_BADGE_CONFIG
} from './transactionBadgeConfig'

export const infoColumns: ColumnsType<UnifiedContentJournal> = [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center'
  },
  {
    title: 'Thời gian',
    align: 'center',
    render(value, record) {
      return (
        <div className='text-start'>
          <p>
            Tạo: {dayjs(record.createdAt).local().format('DD/MM/YYYY HH:mm:ss')}
          </p>
          {record.postedAt && (
            <p className='text-green-600 text-[12px]'>
              TC: {dayjs(record.postedAt).local().format('DD/MM/YYYY HH:mm:ss')}
            </p>
          )}
          {record.archivedAt && (
            <p className='text-red-600 text-[12px]'>
              Lưu trữ:{' '}
              {dayjs(record.archivedAt).local().format('DD/MM/YYYY HH:mm:ss')}
            </p>
          )}
        </div>
      )
    }
  },
  {
    title: 'Mã giao dịch',
    dataIndex: 'transactionCode',
    align: 'center',
    render(value, record) {
      return (
        <div>
          {record.transactionCode ? (
            <Link
              to={PATHS.TRANSACTION_MANAGEMENT.DETAIL_TRANSACTION(record.id)}
              className='text-blue-500 font-bold underline underline-offset-2'
            >
              {record.transactionCode}
            </Link>
          ) : (
            // <span

            //     className="font-medium"
            // >
            //    <TypographyText copyable >{record.transactionCode}</TypographyText>
            // </span>
            <span>--</span>
          )}
        </div>
      )
    }
  },
  {
    title: 'Loại/Mô tả',
    dataIndex: 'transactionType',
    align: 'center',
    render(value, record) {
      const typeKey = record.transactionType as TransactionKey
      const isKnownType = Boolean(TRANSACTION_TYPE_BADGE_CONFIG[typeKey])

      return (
        <div className='flex flex-col gap-1 text-start'>
          <StatusBadge
            status={isKnownType ? typeKey : 'UNKNOWN'}
            config={
              isKnownType
                ? TRANSACTION_TYPE_BADGE_CONFIG
                : {
                    UNKNOWN: {
                      label: value || '--',
                      className: 'normal-status'
                    }
                  }
            }
          />
          <p className='text-gray-500 text-[12px] px-1'>
            {record.description || '--'}
          </p>
        </div>
      )
    }
  },
  {
    title: 'Phương thức thanh toán',
    dataIndex: 'paymentMethod',
    align: 'center',
    render: (value) => {
      const paymentMethodKey = value as PaymentMethodEnum
      const isKnownPaymentMethod = Boolean(
        PAYMENT_METHOD_BADGE_CONFIG[paymentMethodKey]
      )

      return (
        <StatusBadge
          status={isKnownPaymentMethod ? paymentMethodKey : 'UNKNOWN'}
          config={
            isKnownPaymentMethod
              ? PAYMENT_METHOD_BADGE_CONFIG
              : {
                  UNKNOWN: {
                    label: value || '--',
                    className: 'normal-status'
                  }
                }
          }
        />
      )
    }
  },
  // Cột Nguồn
  {
    title: 'Nguồn',
    dataIndex: 'sourceDomain',
    align: 'center',
    render: (value) => {
      const sourceKey = value as SourceDomain
      const isKnownSource = Boolean(SOURCE_DOMAIN_BADGE_CONFIG[sourceKey])

      return (
        <StatusBadge
          status={isKnownSource ? sourceKey : 'UNKNOWN'}
          config={
            isKnownSource
              ? SOURCE_DOMAIN_BADGE_CONFIG
              : {
                  UNKNOWN: {
                    label: value || '--',
                    className: 'normal-status'
                  }
                }
          }
        />
      )
    }
  },
  {
    title: 'Người chuyển',
    align: 'center',
    dataIndex: 'from',
    render: (value) => <PartyCell party={value} />
  },
  {
    title: 'Người nhận',
    align: 'center',
    dataIndex: 'to',
    render: (value) => <PartyCell party={value} />
  }
]
