import { KeyIcon } from '@components/icons'
import React from 'react'

const AuthMethod = () => {
    return (
        <div className=''>
            <p className='mb-3 font-bold text-[18px] flex items-center gap-1'><KeyIcon weight='fill' className='text-blue' /> Phương thức Xác thực</p>
            <hr />
            <div className="flex flex-col gap-3">

                <div className="flex justify-between items-center">
                    <div className="">
                        <p className='font-medium text-[16px]'>Xác thực giao dịch (SoftOTP)</p>
                        <p className='text-gray-500 text-[12px]'>Sử dụng smart OTP trên thiết bị uy tín</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className='flex items-center gap-1 text-green-700 bg-green-100 px-2 rounded-full'>--</p>
                        <p className='text-[12px] font-medium text-red-500'>--</p>
                    </div>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                    <div className="">
                        <p className='font-medium text-[16px]'>Đăng nhập sinh trắc học</p>
                        <p className='text-gray-500 text-[12px]'>Vân tay (Touch ID)/Khuôn mặt (Face ID)</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className='flex items-center gap-1 text-green-700 bg-green-100 px-2 rounded-full'>--</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AuthMethod