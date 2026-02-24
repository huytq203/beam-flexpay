import { CardComponent } from '@components/index'
import { Calculator, CornerDownRight, EyeOutlined } from '@components/icons'
import React from 'react'

const DetailRefundModal = () => {
    return (
        <>
            <div className="grid grid-cols-2 gap-3 items-center">
                <div className="col-span-1 flex flex-col gap-3 h-full" >
                    <CardComponent className='h-full' content={<>
                        <span className='font-bold text-gray-500 '>Thông tin yêu cầu</span>
                        <hr className='my-3' />
                        <div className="">
                            {[
                                { lable: 'Người yêu cầu', value: 'Trần Quang A' },
                                { lable: 'Hình thức', value: 'Về ngân hàng' },
                                { lable: 'GD gốc', value: '#9538-38729-748932' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className='text-gray-500'>{item.lable}:</span>
                                    <span className='text-right font-medium'>{item.value}</span>
                                </div>
                            ))}
                            <p className='text-gray-500'>Lý do:</p>
                            <p className='bg-gray-50 border p-3 rounded-md italic'>* Tôi đã chuyển nhầm tài khoản, mong admin thương xót hoàn lại phí để gia đình vui vẻ, many thanks! *</p>
                        </div>

                    </>} />
                    <CardComponent className='h-full' content={<>

                        <p className='font-bold text-gray-500 '>Tài khoản thụ hưởng</p>
                        <hr className='my-3' />
                        <div className="">
                            {[
                                { lable: 'Ngân hàng', value: 'Vietcombank' },
                                { lable: 'Số TK', value: '4759****7984' ,icon:true},
                                { lable: 'Chủ TK', value: 'TRAN QUANG A' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className='text-gray-500'>{item.lable}:</span>
                                    <span className='text-right font-medium'>{item.value} <span>{item.icon?<EyeOutlined/>:''}</span> </span>
                                </div>
                            ))}
                        </div>
                    </>} />
                </div>
                <div className="col-span-1 h-full">
                    <CardComponent className='h-full' content={<>
                        <p className='flex justify-start gap-1  items-center  text-lg font-bold text-blue-700 '> <span className='bg-blue-50 p-1 rounded-lg'><Calculator size={18} /></span> Chi tiết tài chính</p>
                        <hr  className='my-3'/>
                        <div>
                            <div className="flex items-center justify-between text-lg">
                                <p className="font-medium mb-1 ">Số tiền yêu cầu hoàn:</p>
                                <p className="font-medium mb-1">1,000,000 VND</p>
                            </div>


                            <ul className="pl-5 space-y-2 mb-3">
                                {[
                                    { label: 'Cộng: Hoàn phí người chuyển (Sender Fee Reversal)', value: '+5000 VND' },
                                    { label: 'Cộng: Hoàn phí người nhận (Receiver Fee Reversal)', value: '+0 VND' },
                                    { label: 'Trừ: Phí xử lý hoàn tiền người nhận (Sender Fee Reversal)', value: '-0 VND' },
                                    { label: 'Trừ: Phí xử lý hoàn tiền người chuyển (Sender Fee Reversal)', value: '-1,000,000,000,000 VND' },
                                ].map((item, idx) => {
                                    const isPlus = item.value.trim().startsWith('+')

                                    return (
                                        <li
                                            key={idx}
                                            className={`flex items-center text-sm p-1 rounded-md ${isPlus ? 'bg-green-50' : 'bg-red-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <p className="flex items-center gap-1 text-gray-500" >
                                                    <CornerDownRight size={16} />
                                                    {item.label}
                                                </p>

                                                <p
                                                    className={` text-right font-medium ${isPlus ? 'text-green-600' : 'text-red-600'
                                                        }`}
                                                >
                                                    {item.value}
                                                </p>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>

                        <div className="flex justify-between items-center bg-green-50 p-3 border border-green-600 rounded-md mb-3">
                            <div className="">
                                <p className='text-green-700 font-bold '>Số tiền thực nhận (Net credit): </p>
                                <p className='text-sm text-gray-500'>Tiền cộng vào ví/bank khách hàng</p>
                            </div>
                            <div className="flex justify-center items-center text-green-600 font-bold text-lg">
                                <p>995,000 VND</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-red-50 p-3 border border-red-600 rounded-md">
                            <div className="">

                                <p className='text-red-700 font-bold '>Số tiền thực trừ (Net Debit): </p>
                                <p className='text-sm text-gray-500'>Tiền trừ vào tài khoản người nhận</p>
                            </div>
                            <div className="flex justify-center items-center text-red-600 font-bold text-lg">
                                <p>1000,000 VND</p>
                            </div>
                        </div>

                    </>} />
                </div>
            </div>

        </>
    )
}

export default DetailRefundModal