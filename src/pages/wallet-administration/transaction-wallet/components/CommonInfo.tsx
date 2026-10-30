import { CopyableText } from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import { UnifiedContentJournal } from '@type/apiResponseJournal'
import React from 'react'
import {
  CONFIG_STATUS,
  PaymentMethod,
  PaymentMethodKey,
  getTransactionTypeLabel
} from '../constants/Transaction.constant'
import dayjs from 'dayjs'
import { formatCurrency } from '@utils/formatNumber'
import { FreezeNotice, RefundedAmountInfo } from './CommonInfoBlocks'
import { DetailSectionTitle } from './DetailSectionTitle'
import {
  getDisplayStatus,
  getPendingRefundAmount,
  readRefundFields
} from '../dto/transactionRefund.dto'

/** Đọc một khóa chuỗi trong `details`; giá trị không phải chuỗi hoặc rỗng coi như không có. */
const readDetail = (
  details: Record<string, unknown> | undefined,
  key: string
): string | null => {
  const value = details?.[key]
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

interface CommonInfoProps {
  data?: UnifiedContentJournal
  /** Mã đối soát của báo giá phí (FF26BH44R), lấy từ khối fee của detail 360. */
  feeCode?: string | null
}

const CommonInfo = ({ data, feeCode }: CommonInfoProps) => {
  const refundFields = data ? readRefundFields(data) : {}
  const pendingRefund = getPendingRefundAmount(refundFields)
  const completedAt = data?.completedAt ?? data?.postedAt ?? data?.archivedAt
  const isCashIn = data?.transactionType === 'CASH_IN'
  // Lệnh chi hoàn nạp mang mã FW như lệnh rút; mã hoàn của lần chi (RF-…-Pn) và mã nạp gốc
  // nằm trong metadata journal (`details`) để tra ngược về yêu cầu hoàn.
  const refundPayoutRefs =
    data?.transactionType === 'REFUND_BANK_PAYOUT'
      ? {
          refund: readDetail(data.details, 'payoutReference') ??
            readDetail(data.details, 'refundCode'),
          original: readDetail(data.details, 'originalTransactionCode')
        }
      : null
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
      <div className='flex items-center justify-between gap-2'>
        <DetailSectionTitle>Thông tin chung</DetailSectionTitle>
        {/* Cùng badge với cột trạng thái ở danh sách: nhãn theo displayStatus, màu theo CONFIG_STATUS. */}
        {data && (
          <StatusBadge
            status={getDisplayStatus(data)}
            config={CONFIG_STATUS}
          />
        )}
      </div>
      <hr className='my-3' />
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        <div className='col-span-1'>
          <CopyableText
            label='Mã giao dịch:'
            value={data?.transactionCode ?? '--'}
          />
        </div>
        {refundPayoutRefs && (
          <>
            <div className='col-span-1'>
              <CopyableText
                label='Mã hoàn tiền:'
                value={refundPayoutRefs.refund ?? '--'}
              />
            </div>
            <div className='col-span-1'>
              <CopyableText
                label='Giao dịch gốc:'
                value={refundPayoutRefs.original ?? '--'}
              />
            </div>
          </>
        )}
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
                {getTransactionTypeLabel(data?.transactionType)}
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
