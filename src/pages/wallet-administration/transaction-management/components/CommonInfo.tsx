import { CheckCircleFilled, EyeOutlined } from '@components/icons'
import { CopyableText, TooltipComponent } from '@components/index'
import { TransactionItem } from '@type/transaction.type'
import React from 'react'
import { StatusKey, StatusType, TransactionKey, TransactionType } from '../constants/Transaction.constant'
import dayjs from 'dayjs'

interface CommonInfoProps {
  data?: TransactionItem
}

const CommonInfo = ({ data }: CommonInfoProps) => {
  const STATUS_CLASS: Record<string, string> = {
    SUCCESS: 'text-green  border border-green font-medium bg-green',
    ERROR: 'text-red  text-xs border border-red font-medium bg-red',
    WAITING: 'text-blue-600 border border-blue-500 font-medium bg-blue-50',
    REVIEW: 'text-yellow border border-yellow font-medium bg-yellow',
  };
  const typeKeyStatus = data?.status as StatusKey
  const typesKey = data?.type as TransactionKey
  return (
    <>

      <div className=' flex justify-between '>
        <span className='text-blue-700 font-medium '>1. Thông tin chung</span>
        <span className={`flex justify-center items-center gap-1 rounded-full px-2 text-[12px] ${STATUS_CLASS[typeKeyStatus] ?? ''}`}>
          <CheckCircleFilled />
          {StatusType[typeKeyStatus]}
        </span>
      </div>
      <hr className='my-3' />
      <div className='grid grid-cols-3 gap-3 '>
        <div className='col-span-1'>
          <CopyableText
            label="Mã giao dịch:"
            value={data?.transactionCode ?? '--'}
          />
        </div>
        <div className='col-span-1'>
          <div className=''>
            <p className='text-gray-500'>Loại & Phương thức:</p>
            <div className='font-medium'>
              <p>{TransactionType[typesKey]}</p>
              <p>{data?.description??'--'}</p>
            </div>
          </div>
        </div>
        <div className='col-span-1'>
          <CopyableText
            label="Mã chuẩn chi:"
            value={data?.referenceNumber??'--'}
          />
        </div>
        <div className='col-span-1'>
          <CopyableText
            label="Mã đối soát:"
            value={data?.settlementCode??'--'}
          />
        </div>
        <div className='col-span-1'>
          <div className=''>
            <p className='text-gray-500'>Ngân hàng:</p>
            <div className='font-medium'>
              <p>{data?.bankName??'--'}</p>

            </div>
          </div>
        </div>
        <div className='col-span-1'>
          <div className=''>
            <p className='text-gray-500'>Số tài khoản:</p>
            <div className='font-medium'>
              <div className="flex items-center gap-1">
                <span>{data?.accountNumber??'--'}</span>
                <TooltipComponent title="Xem chi tiết" children={<EyeOutlined className='text-gray-500' />} />
              </div>
            </div>
          </div>
        </div>
        <div className='col-span-1'>
          <div className=''>
            <p className='text-gray-500'>Thời gian tạo:</p>
            <p className='font-medium'>{dayjs(data?.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
          </div>
        </div>
        <div className='col-span-1'>
          <div className=''>
            <p className='text-gray-500'>Thời gian hoàn thành:</p>
            <p className='font-medium'>{dayjs(data?.processedAt).format('DD/MM/YYYY HH:mm:ss')}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default CommonInfo