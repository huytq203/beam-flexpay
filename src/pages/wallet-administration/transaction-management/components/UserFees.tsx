import React from 'react'

const UserFees = () => {
    return (
        <>
            <div>
                <p className='text-blue font-medium'>2. Tài chính & phí (User fees)</p>
            </div>
            <hr className='my-3' />
            <div className="bg-teal-50 p-3 rounded-md border ">
                {
                    [
                        { label: 'Số tiền giao dich', value: <span className='font-medium text-xl'>1,000,000 VND</span> },
                        { label: 'Tổng phí', value: <span className='font-medium text-lg text-red-700'>10,000 VND</span> },
                        { label: 'Phí cố định', value: <span className='text-gray-500 text-xs'>5000 VND</span> },
                        { label: 'Phí phần trăm', value: <span className='text-gray-500 text-xs'>5000 VND (0.5%)</span> },
                    ].map((item, index) => (
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
                <p className='font-medium text-lg text-blue-700'>1,010,000 VND</p>
            </div>
        </>
    )
}

export default UserFees