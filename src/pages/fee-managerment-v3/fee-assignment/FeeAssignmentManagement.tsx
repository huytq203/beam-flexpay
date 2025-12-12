import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { Card } from 'antd'

import React from 'react'
import { useForm } from 'react-hook-form'

const FeeAssignmentManagement = () => {
   const {
      handleSubmit,
      reset,
      control,
      formState: { errors }
    } = useForm()
  return (
    <>
    <Card>
      <div className="grid grid-cols-10 gap-3">

      <FormInput control={control} name='' label='Tài khoản' className='col-span-2'/>
      <FormSelect control={control} name='' options={[]} label='Đối tượng áp dụng' className='col-span-2'/>
      <FormSelect control={control} name='' options={[]} label='Loại'  className='col-span-2'/>
      <FormSelect control={control} name='' options={[]} label='Nhà cung cấp'  className='col-span-2'/>
      <FormSelect control={control} name='' options={[]} label='Phương thức giao dịch'  className='col-span-2'/>
      <FormSelect control={control} name='' options={[]} label='Loại thẻ'  className='col-span-2'/>
      <FormSelect control={control} name='' options={[]} label='Nhóm khách hàng'  className='col-span-2'/>
      <FormSelect control={control} name='' options={[]} label='Trạng thái'  className='col-span-2'/>
      <FormDatePicker control={control} name='' label='Thời gian áp dụng'  className='col-span-2 flex flex-col'/>
      <FormDatePicker control={control} name='' label='Thời gian tạo'  className='col-span-2 flex flex-col'/>
      </div>
    </Card>
    </>
  )
}

export default FeeAssignmentManagement