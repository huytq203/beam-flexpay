import { ButtonComponent } from '@components/common'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormSearch = () => {
  const { control } = useForm()
  return (
    <div>
      <form>
        <div className='grid grid-cols-5 gap-3'>
          <FormInput
            control={control}
            name=''
            label='Từ khóa'
            className='col-span-1'
          />
          <FormInput
            control={control}
            name=''
            label='Thông tin khách hàng'
            className='col-span-1'
          />
          <FormSelect
            control={control}
            name=''
            label='Nguồn tạo'
            className='col-span-1'
            options={[]}
          />
          <FormSelect
            control={control}
            name=''
            label='Kênh hoàn'
            className='col-span-1'
            options={[]}
          />
          <FormSelect
            control={control}
            name=''
            label='Trạng thái'
            className='col-span-1'
            options={[]}
          />
          <FormDatePicker
            isRange
            showTime
            control={control}
            name=''
            label='Ngày tạo'
            className='col-span-2'
          />
          <FormDatePicker
            isRange
            showTime
            control={control}
            name=''
            label='Ngày duyệt'
            className='col-span-2'
          />
        </div>
        <div className="flex justify-start items-center gap-3 mt-3">
            <ButtonComponent  content={'Tìm kiếm'} />
            <ButtonComponent type='default'  content={'Xóa lọc'} />
        </div>
      </form>
    </div>
  )
}

export default FormSearch
