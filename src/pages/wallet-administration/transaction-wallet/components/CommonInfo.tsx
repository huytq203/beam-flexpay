import { CheckCircleFilled } from '@components/icons'
import { CopyableText } from '@components/index'
import { UnifiedContentJournal } from '@type/apiResponseJournal'
import React from 'react'
import { StatusKey, StatusType, TransactionKey, TransactionType } from '../constants/Transaction.constant'
import dayjs from 'dayjs'

interface CommonInfoProps {
  data?: UnifiedContentJournal
}

const CommonInfo = ({ data }: CommonInfoProps) => {
  const STATUS_CLASS: Record<string, string> = {
    PENDING: 'text-blue-600 border border-blue-500 font-medium bg-blue-50',
    POSTED: 'text-green-700 border border-green-500 font-medium bg-green-50',
    ARCHIVED: 'text-red-600 border border-red-400 font-medium bg-red-50',
  };
  const typeKeyStatus = data?.status as StatusKey
  const typesKey = data?.transactionType as TransactionKey
  return (
    <>
      <div className='flex justify-between'>
        <span className='text-blue-700 font-medium'>1. Thông tin chung</span>
        <span className={`flex justify-center items-center gap-1 rounded-full px-2 text-[12px] ${STATUS_CLASS[typeKeyStatus] ?? ''}`}>
          <CheckCircleFilled />
          {StatusType[typeKeyStatus] ?? data?.status}
        </span>
      </div>
      <hr className='my-3' />
      <div className='grid grid-cols-3 gap-3'>
        <div className='col-span-1'>
          <CopyableText
            label="Mã giao dịch:"
            value={data?.journalCode ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <div>
            <p className='text-gray-500'>Loại & Phương thức:</p>
            <div className='font-medium'>
              <p>{TransactionType[typesKey] ?? data?.transactionType ?? '--'}</p>
              <p>{data?.paymentMethod ?? '--'}</p>
            </div>
          </div>
        </div>
        <div className='col-span-1'>
          <CopyableText
            label="Mã ngân hàng:"
            value={data?.bankCode ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <CopyableText
            label="Mã tham chiếu ngân hàng:"
            value={data?.bankRefId ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <div>
            <p className='text-gray-500'>Thời gian tạo:</p>
            <p className='font-medium'>{data?.createdAt ? dayjs(data.createdAt).format('DD/MM/YYYY HH:mm:ss') : '--'}</p>
          </div>
        </div>
        <div className='col-span-1'>
          <div>
            <p className='text-gray-500'>Thời gian hoàn thành:</p>
            <p className='font-medium'>{data?.postedAt ? dayjs(data.postedAt).format('DD/MM/YYYY HH:mm:ss') : '--'}</p>
          </div>
        </div>
        {data?.status === 'ARCHIVED' && data.failureReason && (
          <div className='col-span-3'>
            <div className='bg-red-50 border border-red-200 rounded p-2'>
              <p className='text-gray-500'>Lý do thất bại:</p>
              <p className='font-medium text-red-700'>{data.failureReason}</p>
            </div>
          </div>
        )}
        {data?.reversesJournalId && (
          <div className='col-span-3'>
            <CopyableText label="Hoàn tiền cho GD:" value={data.reversesJournalId} />
          </div>
        )}
        {data?.reversedByJournalId && (
          <div className='col-span-3'>
            <CopyableText label="Đã được hoàn bởi GD:" value={data.reversedByJournalId} />
          </div>
        )}
      </div>
    </>
  )
}

export default CommonInfo
