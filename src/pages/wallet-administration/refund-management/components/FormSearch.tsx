import { ButtonComponent } from '@components/common'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormSearch = () => {
  const { control } = useForm()
  return (
    <div>
      <form>
        <div className='grid grid-cols-4 gap-3'>
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
            name='a'
            label='Trạng thái'
            className='col-span-1'
            options={[]}
          />
          <FormDatePicker
            isRange
            showTime
            control={control}
            name='q'
            label='Ngày tạo'
            className='col-span-1'
          />
          <FormDatePicker
            isRange
            showTime
            control={control}
            name=''
            label='Ngày duyệt'
            className='col-span-1'
          />
          <div className='col-span-1 flex items-end w-full'>
            <div className='flex justify-end items-end gap-3 w-full '>
              <ButtonComponent className='flex-1' content={'Tìm kiếm'} />
              <ButtonComponent
              className='flex-1' 
                type='default'
                content={'Xóa lọc'}
              />
            </div>
          </div>
        </div>
        <div className='flex justify-between items-center gap-3 mt-3'>
          {/* <div className="flex justify-center items-center gap-3 ">
            <ButtonComponent content={'Tìm kiếm'} />
            <ButtonComponent type='default' content={'Xóa lọc'} />

          </div> */}

          {/* <ButtonComponent className='' content={'Xuất excel'} /> */}
        </div>
      </form>
    </div>
  )
}

export default FormSearch
