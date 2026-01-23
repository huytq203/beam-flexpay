import { DeviceMobileSpeakerIcon, HistoryOutlined } from '@components/icons/common'
import { ButtonComponent } from '@components/index'
import React from 'react'

const HistoryLogin = () => {
    return (
        <div className='flex flex-col gap-3'>
            <p className='flex items-center gap-1 font-bold text-xl'><HistoryOutlined className='text-blue'/>Lịch sử đăng nhập</p>
            <hr />
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="flex justify-between items-center"
                >
                    <div>
                        <p className='font-bold flex items-center gap-1'><DeviceMobileSpeakerIcon/>Iphone 13 ProMax</p>
                        <p className='text-gray-500 text-sm'>IOS 18.5 - App v2.0.1</p>
                    </div>

                    <div className="flex flex-col items-end">
                        <p className='font-medium'>10:30 - 25/12/2025</p>
                        <p className='text-gray-500 text-sm'>IP: 1.1.1.x.x</p>
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