import { UnifiedContentJournal } from '@type/apiResponseJournal'
import { formatCurrency } from '@utils/formatNumber'
import React from 'react'

interface UserFeesProps {
    data?: UnifiedContentJournal
}

const UserFees = ({ data }: UserFeesProps) => {
    return (
        <>
            <div>
                <p className='text-blue font-medium'>2. Tài chính & phí (User fees)</p>
            </div>
            <hr className='my-3' />
            <div className="bg-teal-50 p-3 rounded-md border ">
                {
                    [
                        { label: 'Số tiền giao dich', value: <span className='font-medium text-xl'>{formatCurrency(data?.grossAmount??0,{ symbol: 'VNĐ', position: 'after' })}</span> },
                        { label: 'Tổng phí', value: <span className='font-medium text-lg text-red-700'>{formatCurrency(data?.feeAmount??0,{ symbol: 'VNĐ', position: 'after' })}</span> },
                        // { label: 'Phí cố định', value: <span className='text-gray-500 text-xs'>5000 VND</span> },
                        // { label: 'Phí phần trăm', value: <span className='text-gray-500 text-xs'>5000 VND (0.5%)</span> },
                    ].map((item) => (
                        <div className="flex justify-between items-center">
                            <p className='font-medium text-gray-500'>{item.label}</p>
                            <p>{item.value}</p>
                        </div>
                    ))
                }

            </div>
            <hr className='my-3' />
            <div className="flex justify-between items-center ">
                <p className='font-medium text-lg'>Tổng thực thu/chi:</p>
                <p className='font-medium text-lg text-blue-700'>{formatCurrency(data?.amount??0,{ symbol: 'VNĐ', position: 'after' })}</p>
            </div>
        </>
    )
}

export default UserFees