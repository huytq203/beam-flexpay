import { EyeFilled } from '@components/icons'
import {
  ButtonComponent,
  CopyableText,
  MaskText,
  StuckTransactionUpdateAction,
  TooltipComponent
} from '@components/index'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import StatusBadge from '@components/status-badge/StatusBadge'
import {
  PaymentMethod,
  PaymentMethodKey,
  StatusKey
} from '../constants/WithdrawHistory.constant'
import {
  resolveDisplayStatus,
  WITHDRAW_DISPLAY_STATUS_CONFIG
} from '../constants/withdrawDisplayStatus'
import { WithdrawDecisionAction } from '../components/WithdrawDecisionAction'
import { BankEnum, BankLabel } from '../constants/bank.constant'
import { WithdrawalStatus } from '@type/withdrawalApproval.type'
import { UnifiedContentJournal } from '@/app/types/apiResponseJournal'
import { formatNumber } from '@/app/utils'
import { cn } from '@/app/utils/cn'
import { buildTransactionFlow } from '@utils/transaction-flow'

interface ColumnProps {
  onViewDetail: (id: string) => Promise<void>
  isDetailLoading: boolean
  loadingId: string | null
}

const getColumn = ({
  onViewDetail,
  isDetailLoading,
  loadingId
}: ColumnProps): ColumnsType<UnifiedContentJournal> => [
  {
    title: '#',
    dataIndex: 'no',
    align: 'center',
    width: 50
  },
  {
    title: 'Mã giao dịch',
    align: 'center',
    render(_, record) {
      return (
        <div className='text-start'>
          <CopyableText value={record.transactionCode} />
          <p className='text-gray-500 text-xs mt-0.5'>
            {record.description ?? '--'}
          </p>
        </div>
      )
    }
  },
  {
    title: 'Người yêu cầu',
    align: 'center',
    render(_, record) {
      const from = record.from
      return (
        <div className='text-center'>
          <MaskText value={from?.displayName} />
          {/* <p className="font-medium">{from?.displayName || from?.username || '--'}</p> */}
          {/* <span className={`text-xs px-1.5 py-0.5 rounded-sm ${from?.type === 'USER' ? 'text-violet-700 bg-violet-50 border border-violet-300' : 'text-gray-500 bg-gray-50 border border-gray-200'}`}>
                        {from?.type ?? '--'}
                    </span> */}
        </div>
      )
    }
  },
  {
    title: 'Thụ hưởng',
    align: 'center',
    dataIndex: 'to',
    render(value, record) {
      return (
        <div className='text-start'>
          <p className='font-medium'>
            {BankLabel[value?.displayName as BankEnum] ||
              value?.displayName ||
              '--'}
          </p>
          {record.maskedAccount && (
            <p className='mt-0.5 text-xs text-gray-500'>
              STK: {record.maskedAccount}
            </p>
          )}
          {/* {record.bankCode && (
                        <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-300 px-1.5 py-0.5 rounded-sm">
                            {record.bankCode}
                        </span>
                    )} */}
        </div>
      )
    }
  },
  {
    title: 'Số tiền rút',
    align: 'right',
    render(_, record) {
      return (
        <span className='whitespace-nowrap font-medium tabular-nums'>
          {formatNumber(buildTransactionFlow(record).principal)}{' '}
          {record.currency}
        </span>
      )
    }
  },
  {
    title: 'Phí rút',
    align: 'right',
    render(_, record) {
      const { senderFee, receiverFee } = buildTransactionFlow(record)
      return (
        <span className='whitespace-nowrap font-medium tabular-nums amount-negative'>
          {formatNumber(senderFee + receiverFee)} {record.currency}
        </span>
      )
    }
  },
  {
    title: 'Tổng tiền trừ ví',
    align: 'right',
    render(_, record) {
      const walletDebit = buildTransactionFlow(record).totals?.walletDebit ?? 0
      return (
        <span className='whitespace-nowrap font-medium tabular-nums amount-negative'>
          -{formatNumber(walletDebit)} {record.currency}
        </span>
      )
    }
  },
  {
    title: 'Tổng tiền cộng bank',
    align: 'right',
    render(_, record) {
      // Chỉ có tiền về bank khi lệnh đã thành công; lệnh chờ/thất bại hiện "—".
      if (record.status !== StatusKey.POSTED)
        return <span className='text-gray-500'>—</span>
      const bankCredit = buildTransactionFlow(record).totals?.bankCredit ?? 0
      return (
        <span className='whitespace-nowrap font-medium tabular-nums amount-positive'>
          +{formatNumber(bankCredit)} {record.currency}
        </span>
      )
    }
  },
  {
    title: 'Phương thức',
    dataIndex: 'paymentMethod',
    align: 'center',
    render(value: string) {
      return (
        <span className='text-[12px] px-2 py-0.5 rounded-sm bg-gray-100 border border-gray-300 text-gray-700 font-medium'>
          {PaymentMethod[value as PaymentMethodKey] ?? '--'}
        </span>
      )
    }
  },
  {
    title: 'Thời gian',
    align: 'center',
    render(_, record) {
      return (
        <div className='text-start text-[12px]'>
          <p>Tạo: {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</p>
          {record.postedAt && (
            <p className='text-green-600'>
              TC: {dayjs(record.postedAt).format('DD/MM/YYYY HH:mm')}
            </p>
          )}
        </div>
      )
    }
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    align: 'center',
    render(_, record) {
      const displayStatus = resolveDisplayStatus(record)
      return (
        <div>
          <StatusBadge
            className={cn(
              displayStatus == StatusKey.PENDING && 'animate-pulse-soft'
            )}
            status={displayStatus}
            config={WITHDRAW_DISPLAY_STATUS_CONFIG}
          />
        </div>
      )
    }
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 110,
    render(_, record) {
      return (
        <div className='flex justify-center items-center gap-2'>
          {/* Chờ duyệt chỉ chốt qua Duyệt/Từ chối, không xử lý giao dịch treo. */}
          {resolveDisplayStatus(record) ===
          WithdrawalStatus.PENDING_APPROVAL ? (
            <WithdrawDecisionAction transactionCode={record.transactionCode} />
          ) : (
            <StuckTransactionUpdateAction
              compact
              transactionCode={record.transactionCode}
              transactionType={record.transactionType}
              journalStatus={record.status}
            />
          )}
          <TooltipComponent title='Xem chi tiết'>
            <ButtonComponent
              aria-label='Xem chi tiết'
              onClick={() => void onViewDetail(record.id)}
              loading={loadingId === record.id}
              disabled={isDetailLoading}
              size='small'
              type='default'
              icon={<EyeFilled />}
            />
          </TooltipComponent>
        </div>
      )
    }
  }
]

export default getColumn
