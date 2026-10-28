import type {
  TransactionFeeDetail,
  TransactionProfit,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'
import { resolveProviderCost } from '../utils/grossProfit'
import { DetailSectionTitle } from './DetailSectionTitle'

interface FeeNCCProps {
  data?: UnifiedContentJournal
  profit?: TransactionProfit | null
  fee?: TransactionFeeDetail | null
}

/** "Tên (MÃ)", chỉ mã khi danh mục chưa có tên, rỗng khi không có mã. */
const partnerText = (code?: string | null, name?: string | null): string => {
  if (!code) return ''
  return name ? `${name} (${code})` : code
}

const FeeNCC = ({ data, profit, fee }: FeeNCCProps) => {
  const currency = data?.currency ?? 'VND'
  const formatMoney = (value: number) =>
    formatCurrency(value, { symbol: currency, position: 'after' })
  const providerCost = resolveProviderCost(fee, profit)
  const items = (fee?.inputCosts ?? []).filter((item) => item.amount != null)
  // NCC theo báo giá phí (có tên); fee bản cũ chưa trả thì lấy mã NCC ghi trên journal.
  const provider = fee?.providerCode
    ? partnerText(fee.providerCode, fee.providerName)
    : partnerText(data?.providerCode)
  const bank = partnerText(fee?.bankCode, fee?.bankName)
  // Tên chính sách đọc từ fee service; chỉ hiện khi wallet-core đã trả, thiếu thì giữ nguyên như cũ.
  const inputCostPolicyName = fee?.inputCostPolicyName?.trim() || null

  return (
    <>
      <DetailSectionTitle>Chi phí nhà cung cấp</DetailSectionTitle>
      <hr className='my-3' />
      <div className='flex flex-col gap-3 px-3'>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Nhà cung cấp:</p>
          <p className='font-medium text-right'>{provider}</p>
        </div>
        {bank && (
          <div className='flex justify-between items-center gap-2'>
            <p className='text-gray-500'>Ngân hàng:</p>
            <p className='font-medium text-right'>{bank}</p>
          </div>
        )}
        {inputCostPolicyName && (
          <div className='flex justify-between items-center gap-2'>
            <p className='text-gray-500'>Chính sách phí đầu vào:</p>
            <p className='font-medium text-right'>{inputCostPolicyName}</p>
          </div>
        )}
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
            <p className='font-medium tabular-nums'>
              {formatMoney(item.amount ?? 0)}
            </p>
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
