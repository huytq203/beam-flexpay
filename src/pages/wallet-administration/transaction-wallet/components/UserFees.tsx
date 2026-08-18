import type { TransactionProfit, UnifiedContentJournal } from '@type/apiResponseJournal'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'

interface UserFeesProps {
    data?: UnifiedContentJournal
    profit?: TransactionProfit | null
}

const UserFees = ({ data, profit }: UserFeesProps) => {
    const currency = data?.currency ?? 'VND'
    const formatMoney = (value?: number | null) =>
        value == null
            ? '--'
            : formatCurrency(value, { symbol: currency, position: 'after' })
    const userFeeTotal = profit?.userFeeTotal ?? data?.feeAmount

    return (
        <>
            <div>
                <p className='text-blue font-medium'>Tài chính & phí người dùng</p>
            </div>
            <hr className='my-3' />
            <div className='rounded-md border border-teal-200 bg-teal-50 p-3'>
                <div className='flex flex-wrap items-baseline justify-between gap-2'>
                    <p className='font-medium text-teal-900'>Số tiền giao dịch</p>
                    <p className='text-xl font-semibold text-teal-950'>{formatMoney(data?.grossAmount)}</p>
                </div>
                <div className='mt-2 flex flex-wrap items-baseline justify-between gap-2'>
                    <p className='font-medium text-teal-900'>Tổng phí người dùng</p>
                    <p className='text-lg font-semibold text-red-700'>{formatMoney(userFeeTotal)}</p>
                </div>
            </div>

            
            {/* <div className='mt-3'>
                <CopyableText label='Fee calculation ID:' value={data?.feeCalculationId ?? '--'} />
            </div> */}

            {profit?.feeBreakdownAvailable && profit.userFeeBreakdown.length > 0 && (
                <div className='mt-3 space-y-2' aria-label='Chi tiết cấu phần phí'>
                    {profit.userFeeBreakdown.map((item, index) => (
                        <div
                            key={`${item.componentType}-${index}`}
                            className='rounded-md border border-border bg-white p-3'
                        >
                            <div className='flex flex-wrap items-center justify-between gap-2'>
                                <p className='font-medium'>{item.componentType}</p>
                                <p className='font-semibold text-red-700'>{formatMoney(item.calculatedFee)}</p>
                            </div>
                            <div className='mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 sm:grid-cols-4'>
                                <p>Phí cố định: {formatMoney(item.fixedAmount)}</p>
                                <p>Tỷ lệ: {item.percentage == null ? '--' : `${item.percentage}%`}</p>
                                <p>Giá trị gốc: {formatMoney(item.baseValue)}</p>
                                <p>Phí theo tỷ lệ: {formatMoney(item.percentageFee)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <hr className='my-3' />
            <div className='flex flex-wrap items-center justify-between gap-2'>
                <p className='font-medium text-lg'>Tổng thực thu/chi:</p>
                <p className='font-medium text-lg text-blue-700'>{formatMoney(data?.amount)}</p>
            </div>
        </>
    )
}

export default UserFees
