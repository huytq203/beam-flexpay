import type { TransactionProfit, UnifiedContentJournal } from '@type/apiResponseJournal'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'

interface FeeNCCProps {
  data?: UnifiedContentJournal
  profit?: TransactionProfit | null
}

const FeeNCC = ({ data, profit }: FeeNCCProps) => {
  const currency = data?.currency ?? 'VND'
  const providerCost = profit?.providerCost
  const hasProviderCost = profit?.providerCostAvailable && providerCost != null

  return (
    <>
      <div>
        <p className='font-medium text-yellow-700'>Chi phí nhà cung cấp</p>
      </div>
      <hr className='my-3' />
      <div className='flex flex-col gap-3 px-3'>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Nhà cung cấp:</p>
          <p className='font-medium'>{data?.bankCode ?? data?.sourceDomain ?? '--'}</p>
        </div>
        <div className='flex flex-wrap items-center justify-between gap-2 rounded-md bg-orange-100 px-3 py-3'>
          <p className='font-medium'>Tổng phí phải trả:</p>
          <p className='font-medium text-red-700'>
            {hasProviderCost
              ? formatCurrency(providerCost, { symbol: currency, position: 'after' })
              : '--'}
          </p>
        </div>
      </div>
    </>
  )
}

export default FeeNCC
