import { Radio } from '@components/common'
import { FormDatePicker, FormInputNumber, FormRadio, FormTextArea } from '@components/form'
import { Warning } from '@components/icons/common'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogFreeze = () => {
    const { control } = useForm()
    return (
        <div>
            <form>

                <div className=" border rounded-md bg-gray-100">
                    <div className="flex justify-between items-center p-2 border-b">
                        <p>Mã GD:<span className='font-medium'>TRX-473892</span></p>
                        <p>Người nhận:<span className='font-medium'>Trần Quang A</span></p>
                    </div>
                    <div className="flex justify-between items-center p-2">
                        <p>Giá trị giao dịch gốc:</p>
                        <p className='font-medium'>1,000,000 VND</p>
                    </div>
                </div>
                <div className="mt-3 flex flex-col gap-3">
                    <FormRadio label='Hình thức đóng băng' control={control} name='a' options={[
                        { value: 1, label: 'Đóng băng toàn bộ' },
                        { value: 2, label: 'Đóng băng một phần' },
                    ]} />
                    <FormInputNumber suffix="VNĐ" control={control} name='' placeholder='Nhập số tiền...' label={<span>Số tiền cần đống băng <span className='text-red-600'>*</span></span>} />
                    <div >
                        <FormDatePicker showTime control={control} name='' label='Thời gian đóng băng (Tự động)' />
                        <span className='text-gray-500 text-sm'> <span className='text-red-600'>*</span>Để trống sẽ băng vô thời hạn</span>
                    </div>
                    <FormTextArea control={control} name='' placeholder='Nhập lý do...' label={<span>Lý do đóng băng <span className='text-red-600'>*</span></span>} />
                </div>
                <div className="bg-orange-50 mt-3 p-3 text-yellow-700 rounded-md">
                    <p><span className='font-medium flex items-center gap-1'><Warning/>Lưu ý:</span> Hệ thống sẽ trừ tiền từ  <span className='underline'> Ví Khả Dụng </span>và chuyển sang <span className='underline'>Ví Đóng Băng</span> của tài khoản<span className='font-medium'> Trần Quang A</span></p>
                </div>
            </form>
        </div>
    )
}

export default DialogFreeze