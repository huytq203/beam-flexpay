import { CheckCircleFilled, KeyIcon } from '@components/icons/common'
import React from 'react'

const AuthMethod = () => {
    return (
        <div className=''>
            <p className='mb-3 font-bold text-xl flex items-center gap-1'><KeyIcon weight='fill' className='text-blue' /> Phương thức Xác thực</p>
            <hr />
            <div className="flex flex-col gap-3">

                <div className="flex justify-between items-center">
                    <div className="">
                        <p className='font-medium text-lg'>Xác thực giao dịch (SoftOTP)</p>
                        <p className='text-gray-500 text-sm'>Sử dụng smart OTP trên thiết bị uy tín</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className='flex items-center gap-1 text-green-700 bg-green-100 px-2 rounded-full'><CheckCircleFilled/>Đang kích hoạt</p>
                        <p className='text-sm font-medium text-red-500'>Hủy kích hoạt (Reset)</p>
                    </div>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                    <div className="">
                        <p className='font-medium text-lg'>Đăng nhập sinh trắc học</p>
                        <p className='text-gray-500 text-sm'>Vân tay (Touch ID)/Khuôn mặt (Face ID)</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className='flex items-center gap-1 text-green-700 bg-green-100 px-2 rounded-full'>Đang bật</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AuthMethod