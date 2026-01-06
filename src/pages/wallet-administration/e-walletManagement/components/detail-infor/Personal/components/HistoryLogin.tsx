import { ButtonComponent } from '@components/common'
import React from 'react'

const HistoryLogin = () => {
    return (
        <div className='flex flex-col gap-3'>
            <p>Lịch sử đăng nhập</p>
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="flex justify-between items-center"
                >
                    <div>
                        <p>Iphone 13 ProMax</p>
                        <p>IOS 18.5 - App v2.0.1</p>
                    </div>

                    <div className="flex flex-col items-end">
                        <p>10:30 - 25/12/2025</p>
                        <p>IP: 1.1.1.x.x</p>
                    </div>
                </div>
            ))}


            <div className="flex-1 ">
                <ButtonComponent danger type='default' className='w-full' content={'Đăng xuất khỏi thiết bị'} />
            </div>
        </div>
    )
}

export default HistoryLogin