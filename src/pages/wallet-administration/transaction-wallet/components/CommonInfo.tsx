import { CheckCircleFilled } from '@components/icons'
import { CopyableText } from '@components/index'
import { UnifiedContentJournal } from '@type/apiResponseJournal'
import React from 'react'
import {
  PaymentMethod,
  PaymentMethodKey,
  StatusKey,
  StatusType,
  TransactionKey,
  TransactionType
} from '../constants/Transaction.constant'
import dayjs from 'dayjs'
import { formatCurrency } from '@utils/formatNumber'
import { FreezeNotice, RefundedAmountInfo } from './CommonInfoBlocks'
import {
  getDisplayStatus,
  getPendingRefundAmount,
  readRefundFields
} from '../dto/transactionRefund.dto'

interface CommonInfoProps {
  data?: UnifiedContentJournal
  /** Mã đối soát của báo giá phí (FF26BH44R), lấy từ khối fee của detail 360. */
  feeCode?: string | null
}

const CommonInfo = ({ data, feeCode }: CommonInfoProps) => {
  const STATUS_CLASS: Record<string, string> = {
    PENDING: 'text-blue-600 border border-blue-500 font-medium bg-blue-50',
    POSTED: 'text-green-700 border border-green-500 font-medium bg-green-50',
    ARCHIVED: 'text-red-600 border border-red-400 font-medium bg-red-50'
  }
  const typeKeyStatus = data?.status as StatusKey
  const displayStatus = data ? getDisplayStatus(data) : undefined
  const refundFields = data ? readRefundFields(data) : {}
  const pendingRefund = getPendingRefundAmount(refundFields)
  const typesKey = data?.transactionType as TransactionKey
  const completedAt = data?.completedAt ?? data?.postedAt ?? data?.archivedAt
  const isCashIn = data?.transactionType === 'CASH_IN'
  const beneficiaryAccount = isCashIn
    ? data?.to?.username || data?.to?.displayName || data?.to?.id || '--'
    : (data?.maskedAccount ?? '--')
  const formatDateTime = (value?: string | null) =>
    value ? dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss') : '--'
  const formatMoney = (value: number) =>
    formatCurrency(value, {
      symbol: data?.currency ?? 'VND',
      position: 'after'
    })

  return (
    <>
      <div className='flex justify-between'>
        <span className='text-blue-700 font-medium'>Thông tin chung</span>
        <span
          className={`flex justify-center items-center gap-1 rounded-full px-2 text-[12px] ${STATUS_CLASS[typeKeyStatus] ?? ''}`}
        >
          <CheckCircleFilled />
          {StatusType[displayStatus as StatusKey] ?? displayStatus}
        </span>
      </div>
      <hr className='my-3' />
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        <div className='col-span-1'>
          <CopyableText
            label='Mã giao dịch:'
            value={data?.transactionCode ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <CopyableText
            label='Mã đối soát:'
            value={data?.journalCode ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <CopyableText
            label='GL transaction ID:'
            value={data?.transactionId ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <CopyableText
            label='Fee calculation ID:'
            value={data?.feeCalculationId ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <CopyableText
            label='Mã phí:'
            value={feeCode ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <div>
            <p className='text-gray-500'>Loại & Phương thức:</p>
            <div className='font-medium'>
              <p>
                {TransactionType[typesKey] ?? data?.transactionType ?? '--'}
              </p>
              <p>
                {PaymentMethod[data?.paymentMethod as PaymentMethodKey] ??
                  data?.paymentMethod ??
                  '--'}
              </p>
            </div>
          </div>
        </div>

        <div className='col-span-1'>
          <CopyableText
            label='Mã ngân hàng:'
            value={data?.bankCode ?? '--'}
          />
        </div>
        {/* <div className='col-span-1'>
          <CopyableText
            label="Mã tham chiếu ngân hàng:"
            value={data?.bankRefId ?? '--'}
          />
        </div> */}
        <div className='col-span-1'>
          <CopyableText
            label={isCashIn ? 'Ví thụ hưởng:' : 'Tài khoản thụ hưởng:'}
            value={beneficiaryAccount}
          />
        </div>
        <div className='col-span-1'>
          <div>
            <p className='text-gray-500'>Thời gian tạo:</p>
            <p className='font-medium'>{formatDateTime(data?.createdAt)}</p>
          </div>
        </div>
        <div className='col-span-1'>
          <div>
            <p className='text-gray-500'>Thời gian hoàn thành:</p>
            <p className='font-medium'>{formatDateTime(completedAt)}</p>
          </div>
        </div>
        <RefundedAmountInfo
          fields={refundFields}
          pendingRefund={pendingRefund}
          formatMoney={formatMoney}
        />
        {data?.description && (
          <div className='sm:col-span-2 xl:col-span-3'>
            <p className='text-gray-500'>Nội dung giao dịch:</p>
            <p className='break-words font-medium'>{data.description}</p>
          </div>
        )}
        {data?.frozen && data.freeze && (
          <FreezeNotice
            freeze={data.freeze}
            formatMoney={formatMoney}
          />
        )}
        {data?.status === 'ARCHIVED' && data.failureReason && (
          <div className='sm:col-span-2 xl:col-span-3'>
            <div className='bg-red-50 border border-red-200 rounded-sm p-2'>
              <p className='text-gray-500'>Lý do thất bại:</p>
              <p className='font-medium text-red-700'>{data.failureReason}</p>
            </div>
          </div>
        )}
        {data?.reversesJournalId && (
          <div className='sm:col-span-2 xl:col-span-3'>
            <CopyableText
              label='Hoàn tiền cho GD:'
              value={data.reversesJournalId}
            />
          </div>
        )}
        {data?.reversedByJournalId && (
          <div className='sm:col-span-2 xl:col-span-3'>
            <CopyableText
              label='Đã được hoàn bởi GD:'
              value={data.reversedByJournalId}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default CommonInfo
