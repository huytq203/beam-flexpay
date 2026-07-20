import { UnifiedContentJournal } from '@type/apiResponseJournal'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'

interface FeeNCCProps {
  data?: UnifiedContentJournal
}

const FeeNCC = ({ data }: FeeNCCProps) => {
  return (
    <>
      <div>
        <p className='font-medium text-yellow-500'>6. Chi phí NCC (COST)</p>
      </div>
      <hr className='my-3' />
      <div className='flex flex-col gap-3 px-3'>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Nhà cung cấp:</p>
          <p className='font-medium'>{ '--'}</p>
        </div>
        <div className='flex justify-between items-center px-1 py-3 bg-orange-100 rounded-md'>
          <p className='font-medium'>Tổng phí phải trả:</p>
          <p className='text-red-600 font-medium'>{formatCurrency( 0, { symbol: 'VNĐ', position: 'after' })}</p>
        </div>
        <div className='flex flex-col gap-2 border-l-2 border-orange-500 pl-2 mx-2'>
         <ul className=' list-disc text-gray-500 text-[12px] italic'>
          <li className='flex justify-between'>
            <p>Phí giao dịch:</p>
            <p>0 VND</p>
          </li>
          <li className='flex justify-between'>
            <p>% (0.5%):</p>
            <p>0 VND</p>
          </li>
         </ul>
        </div>
      </div>
    </>
  )
}

export default FeeNCC
