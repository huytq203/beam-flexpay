import { ButtonComponent } from '@components/index'
import { TransactionItem } from '@type/transaction.type'
import React from 'react'

interface InfoUserProps {
  data?: TransactionItem
}

const InfoUser = ({ data }: InfoUserProps) => {
  return (
    <>
          <div className="">
            <p className='text-violet-500 font-medium'>5. Người thực hiện</p>
          </div>
          <hr className='my-3' />
          <div className="flex items-center gap-1 mb-3">
            <div className="flex justify-center items-center w-10 h-10 bg-violet-100 rounded-full">A</div>
            <div className="">
              <p className='font-medium text-lg'>{data?.fullName??'--'}</p>
              <p className='text-gray-500 text-xs'>{data?.phoneNumber??'--'}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex justify-between items-center">
              <p className='text-gray-500'>Mã ví:</p>
              <p className='font-medium'>{data?.walletCode??'--'}</p>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <p className='text-gray-500'>Trạng thái ví:</p>
              <p className='text-green-700 font-medium'>{data?.walletStatus??'--'}</p>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <p className='text-gray-500'>Cấp độ (Tier):</p>
              <p className='text-yellow-700 font-medium bg-yellow-50 px-2 rounded-md'>{data?.walletLevel??'--'}</p>
            </div>
          </div>
          <div className="flex">

            <ButtonComponent className='w-full' content='Xem hồ sơ User' />
          </div>
        </>
  )
}

export default InfoUser