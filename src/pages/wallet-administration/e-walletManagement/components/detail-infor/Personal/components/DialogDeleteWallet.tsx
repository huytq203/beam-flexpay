import { FormTextArea } from '@components/form'
import { StopOutlined } from '@components/icons'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogDeleteWallet = () => {
    const {control}=useForm()
    return (
        <div className='space-y-3'>
            <p>Khách hàng: <strong>Nguyễn Văn A</strong></p>
            <div className="p-3 bg-red text-red border border-red rounded-md flex-between">
                <p>Số dư hiện tại:</p>
                <p className='font-bold'>5,000,000 VND</p>
            </div>
            <div className="p-3 bg-red text-red border border-red rounded-md">
                <p className='font-bold flex-start gap-1'><StopOutlined/> Không được phép xóa</p>
                <p>Ví này vẫn còn số dư khả dụng. Để đảm bảo an toàn tài sản bạn vui lòng:</p>
                <ul className='list-disc pl-5'>
                    <li>Yêu cầu khách hàng rút hết tiền</li>
                    <li>Thực hiện lệnh điều chỉnh số dư về 0</li>
                </ul>
            </div>
            <div className="p-3 bg-red text-red border border-red rounded-md">
                <p><strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Khách hàng sẽ mất quyền truy cập  vĩnh viễn vào hệ thống</p>

            </div>
            <FormTextArea control={control} name='' label={<span>Lý do hủy dịch vụ<span className='text-red'>*</span>:</span>} placeholder='Nhập lý do hủy dịch vụ...'/>
        </div>
    )
}

export default DialogDeleteWallet
