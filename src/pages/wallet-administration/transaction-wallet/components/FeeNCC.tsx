import type {
  TransactionFeeDetail,
  TransactionProfit,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'

interface FeeNCCProps {
  data?: UnifiedContentJournal
  profit?: TransactionProfit | null
  fee?: TransactionFeeDetail | null
}

const FeeNCC = ({ data, profit, fee }: FeeNCCProps) => {
  const currency = data?.currency ?? 'VND'
  const formatMoney = (value: number) =>
    formatCurrency(value, { symbol: currency, position: 'after' })
  // Ưu tiên phí đầu vào wallet-core đọc từ fee service; không có thì mới dùng profit cũ.
  const providerCost = fee
    ? fee.totalInputCost
    : profit?.providerCostAvailable
      ? profit.providerCost
      : null
  const items = (fee?.inputCosts ?? []).filter((item) => item.amount != null)

  return (
    <>
      <div>
        <p className='font-medium text-yellow-700'>Chi phí nhà cung cấp</p>
      </div>
      <hr className='my-3' />
      <div className='flex flex-col gap-3 px-3'>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Nhà cung cấp:</p>
          <p className='font-medium'>{data?.providerCode ?? ''}</p>
        </div>
        {items.map((item, index) => (
          <div
            key={`${item.componentType ?? ''}-${index}`}
            className='flex flex-wrap items-baseline justify-between gap-2'
          >
            <div>
              <p className='text-gray-500'>{item.label ?? 'Phí NCC'}</p>
              {item.formula && (
                <p className='text-xs text-gray-500'>{item.formula}</p>
              )}
            </div>
            <p className='font-medium tabular-nums'>{formatMoney(item.amount ?? 0)}</p>
          </div>
        ))}
        <div className='flex flex-wrap items-center justify-between gap-2 rounded-md bg-orange-100 px-3 py-3'>
          <p className='font-medium'>Tổng phí phải trả:</p>
          <p className='font-medium text-red-700'>
            {providerCost != null ? formatMoney(providerCost) : '--'}
          </p>
        </div>
      </div>
    </>
  )
}

export default FeeNCC
