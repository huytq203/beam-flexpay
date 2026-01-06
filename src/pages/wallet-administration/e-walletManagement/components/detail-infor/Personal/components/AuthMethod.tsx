import React from 'react'

const AuthMethod = () => {
    return (
        <div className=''>
            <p className='mb-3'>Phương thức Xác thực</p>
            <hr />
            <div className="flex flex-col gap-3">

                <div className="flex justify-between items-center">
                    <div className="">
                        <p>Xác thực giao dịch (SoftOTP)</p>
                        <p>Sử dụng smart OTP trên thiết bị uy tín</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p>Đang kích hoạt</p>
                        <p>Hủy kích hoạt (Reset)</p>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="">
                        <p>Đăng nhập sinh trắc học</p>
                        <p>Vân tay (Touch ID)/Khuôn mặt (Face ID)</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p>Đang bật</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AuthMethod