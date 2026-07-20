import { ButtonComponent } from '@components/index'
import {
  FormInputNumber,
  FormSelect,
  FormTextArea
} from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const UpdateStatusTransaction = () => {
  const { control } = useForm()
  return (
    <>
      <form>
        <div className='flex justify-between mb-3 items-center border p-3 rounded-md bg-blue-50'>
          <div className=''>
            <p className='font-medium text-blue-700'>Bước 1: Check provider</p>
            <p className='text-gray-500 text-sm'>
              Kiểm tra tài khoản thực tế từ NCC
            </p>
          </div>
          <div className=''>
            <ButtonComponent
              type='default'
              className='text-blue-700'
              content={'Check status'}
            />
          </div>
        </div>
        <div className=''>
          <p className='font-medium text-gray-500'>Bước 2: Cập nhật thủ công</p>
        </div>
        <hr className='my-3' />
        <div className='mb-3'>
          <FormSelect
            control={control}
            name=''
            options={[]}
            label={
              <span>
                Trạng thái mới <span className='text-red-700'>*</span>
              </span>
            }
          />
        </div>
        <div className='border p-3 rounded-md bg-green-50'>
          <p className='font-bold text-green-700 '>Thông tin đối soát (Bắt buộc)</p>
          <div className='flex gap-3 justify-between items-center'>
            <FormInputNumber
              className='flex-1'
              control={control}
              name=''
              label='Mã chuẩn chi (Auth Code)'
              placeholder='VD:123455'
            />
            <FormInputNumber
              className='flex-1'
              control={control}
              name=''
              label='ID Settlement'
               placeholder='VD:5676765454'
            />
          </div>
        </div>
        <div className=''>
          <FormTextArea
            control={control}
            name=''
            label={
              <span>
                Ghi chú/Lý do<span className='text-red-600'>*</span>
              </span>
            }
            placeholder='Nhập lý do cập nhật'
          />
        </div>
      </form>
    </>
  )
}

export default UpdateStatusTransaction
