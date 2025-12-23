import { CardComponent } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormAdd = () => {
  const { control } = useForm()
  return (
    <div>
      <CardComponent
        content={
          <>
            <form>
              <FormInput
                label={<span>Tên đăng nhập <span className='text-red-600'>(*)</span></span>}
                placeholder='Tên đăng nhập...'
                control={control}
                name=''
              />
              <FormInput
                label={<span>Email <span className='text-red-600'>(*)</span></span>}
                placeholder='Email...'
                control={control}
                name=''
              />
              <FormInput
                label={<span>Họ và tên <span className='text-red-600'>(*)</span></span>}
                placeholder='Họ và tên...'
                control={control}
                name=''
              />
              <FormInput
                label={<span>Số điện thoại<span className='text-red-600'>(*)</span></span>}
                placeholder='Số điện thoại...'
                control={control}
                name=''
              />
              <FormSelect
                label={<span>Nhóm quyền <span className='text-red-600'>(*)</span></span>}
                options={[
                  { label: 'Kế toán', value: '1' },
                  { label: 'Kế toán 2', value: '2' },
                  { label: 'Kế toán 3', value: '3' },
                  { label: 'Kế toán 4', value: '4' }
                ]}
                control={control}
                name=''
                mode='multiple'
              />
            </form>
            <p>
              Link tạo mật khẩu sẽ được gửi tự dộng về email cho người dùng sau
              khi tài khoản được tạo thành công
            </p>
          </>
        }
      />
    </div>
  )
}

export default FormAdd
