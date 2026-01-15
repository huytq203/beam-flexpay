import { FormTextArea,FormCheckbox } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogCancel = () => {
    const {control,}=useForm()
  return (
    <div>
      <form>
        <div className="flex flex-col gap-3">
        <p>
          Bạn đang thực hiện hủy xác thực của khách hàng [Tên khách hàng] - [Số
          điện thoại]
        </p>
        <FormTextArea control={control} name='' placeholder='Nhập lý do hủy...' label='Lý do hủy'/>
        <FormCheckbox name='a' control={control} label='Gửi thông báo cho người dùng'/>

        </div>
      </form>
    </div>
  )
}

export default DialogCancel
