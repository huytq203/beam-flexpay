import { TransactionItem } from '@type/transaction.type'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'

interface FeeNCCProps {
  data?: TransactionItem
}

const FeeNCC = ({ data }: FeeNCCProps) => {
  return (
    <>
          <div className="">
            <p className='font-medium text-yellow-500'>6. Chi phí NCC (COST)</p>
          </div>
          <hr className='my-3' />
          <div className="flex flex-col gap-3 px-3">
            <div className="flex justify-between items-center">
              <p className='text-gray-500'>Nhà cung cấp:</p>
              <p className='font-medium'>{data?.providerName??'--'}</p>
            </div>
            <div className="flex justify-between items-center p-1 bg-orange-100  rounded-md">
              <p className=' font-medium'>Tổng phí phải trả:</p>
              <p>{formatCurrency(data?.feeAmount??0,{ symbol: 'VNĐ', position: 'after' })}</p>
            </div>
            <ul className='list-disc pl-5'>
              <li>
                <div className="flex justify-between items-center text-sm">
                  <p className='text-gray-500'>Cố định:</p>
                  <p className='text-gray-500'>{formatCurrency(data?.feeAmount??0,{ symbol: 'VNĐ', position: 'after' })}</p>
                </div>
              </li>
              <li>
                <div className="flex justify-between items-center text-sm">
                  <p className='text-gray-500'>% (0.5%):</p>
                  <p className='text-gray-500'>{formatCurrency(data?.feeAmount??0,{ symbol: 'VNĐ', position: 'after' })}</p>
                </div>
              </li>
            </ul>


          </div>
          <div className="mt-3 text-gray-500 italic text-sm">
            <p>Cấu hình phí áp dụng 01/01/2025</p>

          </div>
        </>
  )
}

export default FeeNCC