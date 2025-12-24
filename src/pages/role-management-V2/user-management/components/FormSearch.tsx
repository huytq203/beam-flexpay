import { ButtonComponent } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

interface props{
    setOpenModalAdd:(value:boolean)=>void
}
const FormSearch = ({setOpenModalAdd}:props) => {
  const { control } = useForm()
  return (
    <>
      <div className='flex w-full gap-3'>
        <form className='flex-1'>
          <div className=' grid grid-cols-3 gap-3 w-full'>
            <FormInput
              label='Tên đăng nhập/họ tên/SĐT'
              placeholder='Tên đăng nhập/họ tên/SĐT...'
              control={control}
              name='username'
              className='col-span-1'
            />

            <FormSelect
              label='Nhóm quyền'
              control={control}
              name='group'
              options={[]}
              className='col-span-1'
            />

            <FormSelect
              label='Trạng thái'
              control={control}
              name='status'
              options={[]}
              className='col-span-1'
            />
          </div>
        </form>

        <div className='flex items-end gap-1'>
          <ButtonComponent content='Tìm kiếm' />
          <ButtonComponent content='Thêm mới' onClick={()=>setOpenModalAdd(true)}/>
          <ButtonComponent content='Xóa lọc' />
        </div>
      </div>
    </>
  )
}

export default FormSearch
