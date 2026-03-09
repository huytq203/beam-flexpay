import { FormTextArea } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogLockAccount = () => {
    const{control}=useForm()
  return (
    <div className='space-y-3'>
        <p>Bạn có chắc chắn muốn khóa tài khoản của <strong>Nguyễn Văn A</strong>? Người dùng sẽ không thể đang nhập</p>
        <FormTextArea control={control} name='' label={<span>Lý do thực hiện <span className='text-red'>*</span></span>} placeholder='Nhập lý do...' />
    </div>
  )
}

export default DialogLockAccount
