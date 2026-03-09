import React from 'react'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'
import { CheckCircleFilled, CloseCircleFilled, InfoCircleFilled } from '@components/icons'
import { FormTextArea } from '@components/form'

const DialogConfirmRefund = () => {
    const { control, watch, setValue } = useForm({
        defaultValues: {
            refundType: '1',
            reason: ''
        }
    })

    const refundType = watch('refundType')

    const baseClass =
        'flex-1 border rounded-md flex flex-col justify-center items-center p-3 cursor-pointer'
    return (
        <>
            <form>

                <div className="flex flex-col justify-center items-center mb-3">
                    <p className='font-medium'>TỔNG TIỀN THỰC HOÀN (NET REFUND)</p>
                    <div className="">
                        <span className='font-bold text-2xl'>995,000 </span><span className='text-sm'>VND</span>

                    </div>
                </div>
                <div className='flex flex-col gap-3 mb-3'>
                    <p className='font-medium'>Quyết định xử lý:</p>
                    <div className='flex items-center gap-3'>
                        <div
                            className={clsx(baseClass, {
                                'text-green-500 border-green-500 bg-green-50':
                                    refundType === '1'
                            })}
                            onClick={() => setValue('refundType', '1')}
                        >
                            <CheckCircleFilled />
                            <p>Phê duyệt</p>
                        </div>
                        <div
                            className={clsx(baseClass, {
                                'text-red-500 border-red-500 bg-red-50': refundType === '2'
                            })}
                            onClick={() => setValue('refundType', '2')}
                        >
                            <CloseCircleFilled />
                            <p>Từ chối</p>
                        </div>
                    </div>
                </div>

                {
                    refundType === '1' && <div className="p-3 border border-blue-700 text-blue-700 mb-3 bg-blue-50 rounded-md">
                        <p><InfoCircleFilled /> Hệ thống sẽ <span>Trừ tiền</span> từ ví Merchant và <span>tạo lệnh chuyển khoản </span>sang Vietcombank cho quý khách ngay lập tức</p>
                    </div>
                }
                {refundType === '2' && <div className="">
                    <FormTextArea control={control} name='reason' label={<span>Lý do từ chối <span className='text-red-600'>*</span></span>} placeholder='Nhập lý do từ chối...' />
                </div>}
            </form>

        </>
    )
}

export default DialogConfirmRefund
