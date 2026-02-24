import { CardComponent } from '@components/index'
import { FormSelect, FormTextArea } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const DialogApproval = () => {
    const{control}=useForm()
  return (
    <>
    <CardComponent content={<div className='space-y-3'>
            <p>Duyệt giao dịch <strong>TRX-473892</strong>. Số tiền: <strong className='text-red-600'>5,000,000 VND</strong></p>
            <FormSelect control={control} name='' options={[]} label='Chọn ngân hàng chi tiền hệ thống'/>
            <strong className='text-green-600'>Số dư khả dụng: 5,000,000 VND</strong>
            <FormTextArea control={control} name='' label='Ghi chú' />
    </div>}/>

    </>
  )
}

export default DialogApproval