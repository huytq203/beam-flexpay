import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { ButtonComponent } from '@components/index'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormSearch = () => {
  const { control } = useForm()
  return (
    <div >
      <form action=''>
        <div className='grid md:grid-cols-3 grid-cols-1 gap-3 w-full'>
          <FormInput
            className='col-span-1'
            control={control}
            name=''
            label='Tìm kiếm nhanh'
            placeholder='Tìm kiếm nhanh'
          />
          <FormSelect
            className='col-span-1'
            control={control}
            name=''
            label='Loại hình kinh doanh'
            options={[]}
          />
          <FormDatePicker
            isRange
            showTime
            className='col-span-1'
            control={control}
            name=''
            label='Thời gian đăng ký'
          />
          <FormDatePicker
            isRange
            showTime
            className='col-span-1'
            control={control}
            name=''
            label='Thời gian kích hoạt'
          />
          <FormSelect
            className='col-span-1'
            control={control}
            name=''
            label='Nhân viên sale'
            options={[]}
          />
          <FormSelect
            className='col-span-1'
            control={control}
            name=''
            label='Trạng thái'
            options={[]}
          />
        </div>
      </form>
      <div className='mt-3 flex justify-end gap-3'>
        <ButtonComponent content='Tìm kiếm' disabled/>
        <ButtonComponent
          type='default'
          content='Xóa lọc'
          disabled
        />
      </div>
    </div>
  )
}

export default FormSearch
