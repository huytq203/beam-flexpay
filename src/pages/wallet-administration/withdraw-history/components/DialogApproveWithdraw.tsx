import { CardComponent, UploadCombined } from '@components/common'
import { FormInput, FormUploadCombined } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogApproveWithdraw = () => {
    const { control } = useForm()
    return (
        <>
            <CardComponent content={
                <div className='space-y-3' >
                    <p>Xác nhận chuyển khoản cho: <strong>TRX-83492</strong></p>
                    <FormInput control={control} name='' label="Mã tham chiếu ngân hàng (Ref no):" placeholder='Nhập mã tham chiếu...' />
                    <FormUploadCombined 
                        control={control} 
                        name='attachments' 
                        label="Tải ảnh lên:"
                        accept="image/*"
                        dragText='Upload ảnh biên lai (UNC)'
                    />
                </div>
            } />
        </>
    )
}

export default DialogApproveWithdraw
