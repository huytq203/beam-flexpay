import { UnifiedContentJournal } from '@type/apiResponseJournal'
import dayjs from 'dayjs'
import { ColumnsType } from 'antd/es/table'
import { Link, NavigateFunction } from 'react-router-dom'
import {
  TagComponent
} from '@components/index'
import {
  PaymentMethodEnum,
  PaymentMethod,
  StatusKey,
  TransactionKey,
  TransactionType,
  BankLabel,
  BankEnum,
  SourceDomain,
  SourceDomainLabel,
  CONFIG_STATUS
} from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { formatNumber } from '@utils/index'
import { PATHS } from '@constants/pathConstant'
import StatusBadge from '@components/status-badge/StatusBadge'
import { cn } from '@utils/cn'

interface ColumnProps {
  navigate: NavigateFunction
}

const getColumn = ({
  navigate
}: ColumnProps): ColumnsType<UnifiedContentJournal> => [
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

      const typeConfig: Record<
        string,
        {
          label: string
          bg: string
          text: string
          dot: string
          border: string
          shimmerColor: string
          glowColor: string
        }
      > = {
        CASH_IN: {
          label: TransactionType.CASH_IN,
          bg: 'bg-green-50/20',
          text: 'text-green-600',
          dot: 'bg-green-600',
          border: 'border-green-200',
          shimmerColor: 'rgba(0, 229, 160, 0.2)',
          glowColor: 'rgba(22, 163, 74, 1)'
        },
        CASH_OUT: {
          label: TransactionType.CASH_OUT,
          bg: 'bg-red-50/20',
          text: 'text-red-600',
          dot: 'bg-red-600',
          border: 'border-red-200',
          shimmerColor: 'rgba(239, 68, 68, 0.2)',
          glowColor: 'rgba(219, 15, 15, 1)'
        },
        P2P_TRANSFER: {
          label: TransactionType.P2P_TRANSFER,
          bg: 'bg-blue-50/20',
          text: 'text-blue-500',
          dot: 'bg-blue-600',
          border: 'border-blue-200',
          shimmerColor: 'rgba(59, 130, 246, 0.2)',
          glowColor: 'rgba(37, 99, 235, 1)'
        },
        MERCHANT_PAYMENT: {
          label: TransactionType.MERCHANT_PAYMENT,
          bg: 'bg-blue-50/20',
          text: 'text-blue-600',
          dot: 'bg-blue-600',
          border: 'border-blue-200',
          shimmerColor: 'rgba(59, 130, 246, 0.2)',
          glowColor: 'rgba(37, 99, 235, 1)'
        },
        REVERSAL: {
          label: TransactionType.REVERSAL,
          bg: 'bg-purple-50/20',
          text: 'text-purple-600',
          dot: 'bg-purple-600',
          border: 'border-purple-200',
          shimmerColor: 'rgba(168, 85, 247, 0.2)',
          glowColor: 'rgba(147, 51, 234, 1)'
        }
      }

      const config = typeConfig[typeKey] || {
        label: value || '--',
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        dot: 'bg-gray-600',
        border: 'border-gray-200',
        shimmerColor: 'rgba(0,0,0,0.05)',
        glowColor: 'rgba(75, 85, 99, 1)'
      }

      return (
        <div className='text-start flex flex-col gap-1 '>
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border} font-bold text-[11px] w-fit whitespace-nowrap relative overflow-hidden before:absolute before:inset-y-0 before:-left-full before:w-[60%] before:bg-[linear-gradient(90deg,transparent,var(--shimmer-color,rgba(0,229,160,0.1)),transparent)] before:animate-shimmer`}
            style={
              { '--shimmer-color': config.shimmerColor } as React.CSSProperties
            }
          >
            <div className='relative flex items-center justify-center'>
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-40 animate-ping-slow`}
              />
              <span
                className={`relative w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse-dot `}
                style={{
                  boxShadow: `0 0 6px 1px ${config.glowColor}`
                }}
              />
            </div>
            {config.label}
          </div>
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
        >
          {PaymentMethod[value as PaymentMethodEnum] || '--'}
        </TagComponent>
      )
    }
  },
  // Cột Nguồn
  {
    title: 'Nguồn',
    dataIndex: 'sourceDomain',
    align: 'center',
    render: (value) => {
      const sourceColors: Record<string, string> = {
        EWALLET: 'gold'
      }
      return (
        <TagComponent color={sourceColors[value as SourceDomain] || 'default'}>
          {SourceDomainLabel[value as SourceDomain] || '--'}
        </TagComponent>
      )
    }
  },
 {
    title: 'Người chuyển',                                                                                                                                     
    align: 'center',                                                                                                                                               dataIndex: 'from',                                                                                                                                         
    render: (value) => (                                                                                                                                       
      <span className='font-medium text-gray-500'>
        {value?.type === 'BANK'
          ? `${BankLabel[value?.displayName as BankEnum]} ${value?.username ? `- ${value?.username}` : ''}`
          : value?.username}
      </span>
    )
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
    title: 'Phí',
    align: 'right',
    render(value, record) {
      return (
        <div className='text-right text-gray-500'>
          <p>{formatNumber(record.feeAmount) + ' ' + record.currency}</p>
        </div>
      )
    }
  },
  {
    title: 'Tổng',
    align: 'right',
    render(value, record) {
      const isDebit =
        record.transactionType === 'CASH_OUT' ||
        record.transactionType === 'MERCHANT_PAYMENT'
      return isDebit ? (
        <div className='text-right font-medium text-red'>
          <p>-{formatNumber(record.grossAmount) + ' ' + record.currency}</p>
        </div>
      ) : (
        <div className='text-right font-medium text-green'>
          <p>+{formatNumber(record.grossAmount) + ' ' + record.currency}</p>
        </div>
      )
    }
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    align: 'center',
    render(value, record) {
      const typeKeyStatus = record.status as StatusKey
      return (
        <StatusBadge
          className={cn(
            record.status === 'PENDING' ? 'animate-pulse-soft' : ''
          )}
          status={typeKeyStatus}
          config={CONFIG_STATUS}
        />
      )
    }
  }
  // {
  //     title: 'Thao tác',
  //     align: 'center',
  //     width: 80,
  //     render(value, record) {
  //         return (
  //             <div className="flex justify-center items-center gap-1">
  //                 <TooltipComponent title='Xem chi tiết'>
  //                     <ButtonComponent
  //                         onClick={() => navigate(`/transaction-management/transaction-wallet/${record.id}`)}
  //                         size='small'
  //                         className='bg-blue-50 !border border-blue-600 text-blue-600 hover:!bg-blue-100 hover:!text-blue-600'
  //                         icon={<EyeFilled />}
  //                     />
  //                 </TooltipComponent>
  //             </div>
  //         )
  //     },
  // },
]
export default getColumn
