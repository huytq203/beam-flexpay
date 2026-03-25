import { UnifiedContentJournal } from '@type/apiResponseJournal'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'
import { BankEnum, BankLabel, PaymentMethod, PaymentMethodKey } from '../constants/Transaction.constant'

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
          <p className='text-gray-500'>Phương thức:</p>
          <p className='font-medium'>{PaymentMethod[data?.paymentMethod as PaymentMethodKey] ?? '--'}</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Mã ngân hàng:</p>
          <p className='font-medium'>{data?.bankCode?? '--'}</p>
        </div>
        <div className='flex justify-between items-center p-1 bg-orange-100 rounded-md'>
          <p className='font-medium'>Tổng phí phải trả:</p>
          <p>{formatCurrency( 0, { symbol: 'VNĐ', position: 'after' })}</p>
        </div>
      </div>
    </>
  )
}

export default FeeNCC
