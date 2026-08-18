import { UnifiedContentJournal } from '@type/apiResponseJournal'
import dayjs from 'dayjs'
import { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import {
  ButtonComponent,
  TooltipComponent
} from '@components/index'
import { LockKeyOpenIcon, SnowflakeIcon } from '@components/icons'
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
import { getFreezeTransactionAction } from './transaction-row-actions'

const TRANSACTION_FREEZE_STATUS = {
  FROZEN: {
    label: 'Đang đóng băng',
    className: 'warning-status',
    shimmerColor: 'rgba(245, 158, 11, 0.18)'
  }
}

const TRANSACTION_TYPE_BADGE_CONFIG: Record<
  TransactionKey,
  { label: string; className: string }
> = {
  CASH_IN: {
    label: TransactionType.CASH_IN,
    className: 'success-status'
  },
  CASH_OUT: {
    label: TransactionType.CASH_OUT,
    className: 'danger-status'
  },
  P2P_TRANSFER: {
    label: TransactionType.P2P_TRANSFER,
    className: 'info-status'
  },
  MERCHANT_PAYMENT: {
    label: TransactionType.MERCHANT_PAYMENT,
    className: 'info-status'
  },
  REVERSAL: {
    label: TransactionType.REVERSAL,
    className: 'normal-status'
  }
}

const SOURCE_DOMAIN_BADGE_CONFIG: Record<
  SourceDomain,
  { label: string; className: string }
> = {
  [SourceDomain.EWALLET]: {
    label: SourceDomainLabel[SourceDomain.EWALLET],
    className: 'normal-status'
  }
}

const PAYMENT_METHOD_BADGE_CONFIG: Record<
  PaymentMethodEnum,
  { label: string; className: string }
> = {
  [PaymentMethodEnum.ATM]: {
    label: PaymentMethod[PaymentMethodEnum.ATM],
    className: 'normal-status'
  },
  [PaymentMethodEnum.CC]: {
    label: PaymentMethod[PaymentMethodEnum.CC],
    className: 'normal-status'
  },
  [PaymentMethodEnum.VA]: {
    label: PaymentMethod[PaymentMethodEnum.VA],
    className: 'normal-status'
  },
  [PaymentMethodEnum.QR_CODE]: {
    label: PaymentMethod[PaymentMethodEnum.QR_CODE],
    className: 'normal-status'
  },
  [PaymentMethodEnum.WALLET_BALANCE]: {
    label: PaymentMethod[PaymentMethodEnum.WALLET_BALANCE],
    className: 'normal-status'
  },
  [PaymentMethodEnum.LINKED_ACCOUNT]: {
    label: PaymentMethod[PaymentMethodEnum.LINKED_ACCOUNT],
    className: 'normal-status'
  }
}

interface ColumnProps {
  canFreeze: boolean
  onFreeze: (transaction: UnifiedContentJournal) => void
  onUnfreeze: (transaction: UnifiedContentJournal) => void
  openingFreezeTransactionId?: string
  openingUnfreezeTransactionId?: string
}

const getColumn = ({
  canFreeze,
  onFreeze,
  onUnfreeze,
  openingFreezeTransactionId,
  openingUnfreezeTransactionId
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
    title: 'Số tiền đang giữ',
    align: 'right',
    width: 170,
    render(_, record) {
      const heldAmount = record.freeze?.heldAmount ?? 0
      return (
        <span
          className={cn(
            'whitespace-nowrap font-medium tabular-nums',
            heldAmount > 0 ? 'amount-caution' : 'text-gray-500'
          )}
        >
          {formatNumber(heldAmount)} {record.currency}
        </span>
      )
    }
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    align: 'center',
    width: 210,
    render(value, record) {
      const typeKeyStatus = record.status as StatusKey
      return (
        <div className='flex flex-wrap items-center justify-center gap-1'>
          <StatusBadge
            className={cn(
              record.status === 'PENDING' ? 'animate-pulse-soft' : ''
            )}
            status={typeKeyStatus}
            config={CONFIG_STATUS}
          />
          {record.frozen && (
            <StatusBadge
              status='FROZEN'
              config={TRANSACTION_FREEZE_STATUS}
            />
          )}
        </div>
      )
    }
  },
  {
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 80,
    render(_, record) {
      if (!canFreeze) return null

      const action = getFreezeTransactionAction(record)
      if (!action) return null

      const isUnfreeze = action === 'unfreeze'
      const label = isUnfreeze
        ? 'Mở băng giao dịch (Unfreeze)'
        : 'Đóng băng giao dịch (Freeze)'
      return (
        <TooltipComponent title={label}>
          <ButtonComponent
            aria-label={label}
            htmlType='button'
            type='default'
            size='small'
            loading={
              openingFreezeTransactionId === record.transactionId ||
              openingUnfreezeTransactionId === record.transactionId
            }
            icon={isUnfreeze
              ? <LockKeyOpenIcon size={17} weight='regular' className='text-emerald-700' aria-hidden />
              : <SnowflakeIcon size={17} weight='regular' className='text-cyan-700' aria-hidden />}
            onClick={() => isUnfreeze ? onUnfreeze(record) : onFreeze(record)}
          />
        </TooltipComponent>
      )
    }
  },
]
export default getColumn
