import { ButtonComponent, CardComponent } from '@components/index'
import React from 'react'
import { MerchanOrderItem } from '../types/apiOrder.type'
import dayjs from 'dayjs'
import { TYPEDATE } from '@constants/date.constant'
import { CheckCircleFilled, CheckCircleOutlined, CheckOutlined } from '@components/icons'
import { QrcodeOutlined } from '@ant-design/icons'
import { formatNumber } from '@utils/formatNumber'

interface props {
    selectOrder: MerchanOrderItem | null
    handleConFirm: (amount: number) => void
}
const ModalDetailOrder = ({ selectOrder, handleConFirm }: props) => {
    return (
        <div>
            <div className="md:flex gap-3 space-y-3 md:space-y-0">

                <CardComponent
                    className='flex-[2] '
                    content={<>
                        {selectOrder &&
                            <>

                                <div className="flex justify-between">
                                    <div >
                                        <p className="font-medium text-lg">{selectOrder.orderCode}</p>
                                        <p className='text-gray-500'>{selectOrder.orderDescription}</p>

                                    </div>
                                    <div className="">
                                        {selectOrder.status == "SUCCESS" ?
                                            <span className='success-status border-green font-medium px-3 py-1 rounded-md text-xs flex justify-center items-center gap-1'><CheckCircleFilled style={{ fontSize: '13px' }} /> {selectOrder.status}</span> :
                                            <span className='info-status border-gray font-medium px-3 py-1 rounded-md text-xs flex justify-center items-center gap-1'> {selectOrder.status}</span>
                                        }
                                    </div>
                                </div>
                                <hr className='my-3' />
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="">
                                        <p className='font-medium'>Số tiền</p>
                                        <p className='text-gray-500 font-medium'>{formatNumber(selectOrder.amount)} {selectOrder.currency}</p>
                                    </div>
                                    <div className="">
                                        <p className='font-medium'>Số tiền thực tế</p>
                                        <p className='text-gray-500 font-medium'>{formatNumber(selectOrder.netAmount)} {selectOrder.currency}</p>
                                    </div>
                                    <div className="">
                                        <p className='font-medium'>Ngân hàng</p>
                                        <p className='text-gray-500 font-medium'>{selectOrder.bankCode}</p>
                                    </div>
                                    <div className="">
                                        <p className='font-medium'>Thời gian tạo</p>
                                        <p className='text-gray-500 font-medium'>{dayjs(selectOrder.createdAt).format(TYPEDATE.fullTime)}</p>
                                    </div>
                                    <div className="">
                                        <p className='font-medium'>Thời gian chỉnh sửa</p>
                                        <p className='text-gray-500 font-medium'>{dayjs(selectOrder.updatedAt).format(TYPEDATE.fullTime)}</p>
                                    </div>

                                </div>
                            </>
                        }

                    </>}
                />
                <CardComponent
                    className='flex-1'
                    content={
                        <div className="flex flex-col justify-between h-full">
                            <div className="space-y-3">
                                <p className='text-lg font-medium'>Virtual Account</p>
                                {selectOrder?.virtualAccount ??
                                    <p className='text-gray-500 mb-3'>No virtual account created yet</p>
                                }
                            </div>
                            {selectOrder?.status == 'SUCCESS' ?
                                <p className='bg-green-50 text-green-700  py-3 rounded-md font-medium flex items-center justify-center gap-1'><CheckOutlined />Đã xác thực thanh toán</p> :
                                <div className="flex flex-col gap-3 mt-auto">
                                    <ButtonComponent className='w-full bg-cyan-500 hover:bg-cyan-300' content={<div className='flex items-center gap-1'><QrcodeOutlined />Xem QR code</div>} />
                                    <ButtonComponent onClick={() => selectOrder && handleConFirm(selectOrder.amount)} className='w-full' content={<div className='flex items-center gap-1'><CheckCircleOutlined />Xác thực</div>} />
                                </div>
                            }
                        </div>
                    }
                />
            </div>

        </div>
    )
}

export default ModalDetailOrder