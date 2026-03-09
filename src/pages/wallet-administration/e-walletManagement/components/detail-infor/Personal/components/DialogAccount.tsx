import { CardComponent } from '@components/index'
import { FormInput, FormInputNumber } from '@components/form'
import { WarningIcon } from '@components/icons'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogAccount = () => {
    const{control}=useForm()
    return (
        <div>
            <p className='text-yellow-600 bg-yellow-50 border border-yellow-600 rounded-md p-3 flex items-center gap-2'> <WarningIcon weight='fill' size={32}/>Lưu ý: chỉ cập nhật số tài khoản và tên tài khoản khi có sai sót nhập liệu, không được phép thay đổi ngân hàng</p>
            <FormInput control={control} disabled  name='' label={<span>Ngân hàng (Không được sửa)</span>} placeholder=''/>
            <FormInputNumber control={control} name='' label={<span>Số tài khoản/Số thẻ<span className='text-red-600'>*</span></span>} placeholder=''/>
            <FormInput control={control} name='' label={<span>Tên tài khoản (Viết hoa không dấu)<span className='text-red-600'>*</span></span>} placeholder=''/>
        </div>
    )
}

export default DialogAccount
