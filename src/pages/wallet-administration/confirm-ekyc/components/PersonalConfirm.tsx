import { ButtonComponent, CardComponent, Input } from '@components/index'
import React from 'react'



const ContenModalConfirm = () => {
    return (
        <>
            <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-3 ">
                    <div className="flex flex-1 gap-2">
                        <div className="flex-1 border rounded bg-gray-400">CCCD mặt trước</div>
                        <div className="flex-1 border rounded bg-gray-400">CCCD mặt sau</div>
                    </div>
                    <div className="flex-[2] border rounded bg-gray-400">
                        Ảnh chân dung
                    </div>
                </div>
                <div className="flex-1 border rounded-md ">
                    <div className="bg-gray-100 p-2">
                        <p >Dữ liệu trích xuất(OCR)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 py-5">
                        {[
                            { label: 'Họ và tên', value: 'Trần Quang A', },
                            { label: 'Số điện thoại', value: '03333333' },
                            { label: 'Email', value: 'A@gmail.com' },
                            { label: 'Loại tài khoản', value: 'Cá nhân' },
                            { label: 'Số CCCD', value: '043243217892' },
                            { label: 'Ngày cấp', value: '10/10/2021' },
                            { label: 'Nơi cấp', value: 'Cục CS QLHC về TTXH' },
                            { label: 'Ngày sinh', value: '01/01/1999' },
                            { label: 'Giới tính', value: 'Nam' },
                            { label: 'Quê quán', value: 'Hải Dương' },
                        ].map((item,index)=>(
                            
                            <div className="col-span-1 mx-2">
                                <span>{item.label}</span>
                                <Input disabled content={item.value}/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </>
    )
}

const PersonalConfirm = () => {
    return (
        <div><CardComponent  content={<ContenModalConfirm />} /></div>
    )
}

export default PersonalConfirm