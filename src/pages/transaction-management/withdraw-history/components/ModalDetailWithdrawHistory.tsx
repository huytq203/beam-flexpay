import type { WithdrawalDetail } from '@services/apiJournal'
import {
  CardComponent,
  StuckTransactionUpdateAction,
  TimeLineComponent,
  WithdrawalDecisionPanel
} from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import { BankFilled, HistoryOutlined, UserIcon } from '@components/icons'
import { UnifiedContentJournal } from '@type/apiResponseJournal'
import {
  CONFIG_STATUS,
  PaymentMethod,
  PaymentMethodKey
} from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { formatNumber } from '@utils/index'
import { buildTransactionFlow } from '@utils/transaction-flow'
import { StatusKey } from '../constants/WithdrawHistory.constant'


import { BeneficiaryInfo, InfoRow } from './WithdrawDetailParts'
import dayjs from 'dayjs'
import React from 'react'

interface Props {
  data?: UnifiedContentJournal
  withdrawalDetail?: WithdrawalDetail
  isLoading?: boolean
}

const JOURNAL_STATUS_CONFIG = {
  ...CONFIG_STATUS,
  ARCHIVED: {
    label: 'Đã lưu trữ',
    className: 'danger-status',
    shimmerColor: 'rgba(255, 86, 59, 0.2)'
  }
}

const DialogDetailWithdrawHistory = ({
  data,
  withdrawalDetail,
  isLoading
}: Props) => {
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-40 text-gray-400'>
        Đang tải dữ liệu...
      </div>
    )
  }

  if (!data) {
    return (
      <div className='flex justify-center items-center h-40 text-gray-400'>
        Không có dữ liệu
      </div>
    )
  }

  const flow = buildTransactionFlow(data)

  const timelineItems = [
    {
      title: 'Tạo yêu cầu rút tiền',
      time: dayjs(data.createdAt).format('DD/MM/YYYY HH:mm:ss'),
      color: 'blue' as const
    },
    ...(data.postedAt
      ? [
          {
            title: 'Giao dịch thành công',
            time: dayjs(data.postedAt).format('DD/MM/YYYY HH:mm:ss'),
            color: 'green' as const
          }
        ]
      : []),
    ...(data.archivedAt
      ? [
          {
            title: 'Đã lưu trữ',
            time: dayjs(data.archivedAt).format('DD/MM/YYYY HH:mm:ss'),
            color: 'red' as const
          }
        ]
      : []),
    ...(data.failureReason
      ? [
          {
            title: `Thất bại: ${data.failureReason}`,
            time: '',
            color: 'red' as const
          }
        ]
      : [])
  ]

  return (
    <div>
      <WithdrawalDecisionPanel
        className='mb-3'
        transactionCode={data.transactionCode}
        transactionType={data.transactionType}
        currency={data.currency}
      />
      <StuckTransactionUpdateAction
        className='mb-3'
        transactionCode={data.transactionCode}
        transactionType={data.transactionType}
        journalStatus={data.status}
      />
      <div className='grid grid-cols-2 h-full gap-3 mb-3'>
        <CardComponent
          className='col-span-1 flex-1 h-full'
          content={
            <div className='h-full'>
              <p className='font-medium flex items-center gap-1'>
                <UserIcon weight='fill' />
                Thông tin giao dịch
              </p>
              <hr className='my-3' />
              <div>
                <InfoRow
                  label='Mã giao dịch'
                  value={data.transactionCode}
                />
                <InfoRow
                  label='Mô tả'
                  value={data.description}
                />
                <InfoRow
                  label='Người yêu cầu'
                  value={data.from?.displayName || data.from?.username || '--'}
                />
                <InfoRow
                  label='Số tiền rút'
                  value={`-${formatNumber(flow.principal)} ${data.currency}`}
                  className='text-red-600'
                />
                <InfoRow
                  label='Phí'
                  value={`${formatNumber(flow.senderFee + flow.receiverFee)} ${data.currency}`}
                />
                <InfoRow
                  label='Tổng'
                  value={`-${formatNumber(flow.totals?.walletDebit ?? data.grossAmount)} ${data.currency}`}
                  className='text-red-600 font-bold'
                />
                <InfoRow
                  label='Tổng tiền cộng bank'
                  value={
                    data.status === StatusKey.POSTED
                      ? `+${formatNumber(flow.totals?.bankCredit ?? 0)} ${data.currency}`
                      : '—'
                  }
                  className={
                    data.status === StatusKey.POSTED
                      ? 'text-green-600 font-bold'
                      : undefined
                  }
                />
                <InfoRow
                  label='Phương thức'
                  value={
                    <span className='text-[12px] px-2 py-0.5 rounded-sm bg-gray-100 border border-gray-300'>
                      {PaymentMethod[data.paymentMethod as PaymentMethodKey] ??
                        '--'}
                    </span>
                  }
                />
                {/* {resolveDisplayStatus(data) !== data.status && (
                  <InfoRow
                    label='Trạng thái'
                    value={
                      <StatusBadge
                        status={resolveDisplayStatus(data)}
                        config={WITHDRAW_DISPLAY_STATUS_CONFIG}
                      />
                    }
                  />
                )} */}
                <InfoRow
                  label='Trạng thái'
                  value={
                    <StatusBadge
                      status={data.status}
                      config={JOURNAL_STATUS_CONFIG}
                    />
                  }
                />
              </div>
            </div>
          }
        />

        <CardComponent
          className='flex-1 col-span-1'
          content={
            <div>
              <p className='font-medium flex items-center gap-1'>
                <BankFilled />
                Thông tin thụ hưởng
              </p>
              <hr className='my-3' />
              <div>
                <BeneficiaryInfo
                  beneficiary={withdrawalDetail?.beneficiary ?? null}
                  fallbackBank={data.to?.displayName || '--'}
                />
                {data.bankRefId && (
                  <InfoRow
                    label='Mã tham chiếu NH'
                    value={data.bankRefId}
                  />
                )}
                {data.transactionId && (
                  <InfoRow
                    label='Mã giao dịch gốc'
                    value={
                      <span className='text-xs break-all'>
                        {data.transactionId}
                      </span>
                    }
                  />
                )}
                {data.reversesJournalId && (
                  <InfoRow
                    label='Hoàn từ'
                    value={data.reversesJournalId}
                  />
                )}
                {data.reversedByJournalId && (
                  <InfoRow
                    label='Bị hoàn bởi'
                    value={data.reversedByJournalId}
                  />
                )}
              </div>
            </div>
          }
        />

        <CardComponent
          className='col-span-2'
          content={
            <>
              <p className='font-medium flex items-center gap-1'>
                <HistoryOutlined />
                Lịch sử xử lý
              </p>
              <hr className='my-3' />
              <div className='h-40 overflow-auto'>
                <TimeLineComponent items={timelineItems} />
              </div>
            </>
          }
        />
      </div>
    </div>
  )
}

export default DialogDetailWithdrawHistory
