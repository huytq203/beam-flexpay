import { ButtonComponent } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

interface props{
    setOpenModalAdd:(value:boolean)=>void,
}
const FormSearch = ({setOpenModalAdd}:props) => {
    const { control } = useForm()
    return (
        <>
            <div className='flex w-full gap-3'>
                <form className='flex-1'>
                    <div className=' grid grid-cols-3 gap-3 w-full'>
                        
                        <FormInput
                            label='Mã quyền'
                            placeholder='Mã quyền...'
                            control={control}
                            name=''
                            className='col-span-1'
                        />
                        <FormInput
                            label='Tên quyền'
                            placeholder='Tên quyền...'
                            control={control}
                            name=''
                            className='col-span-1'
                        />
                        <FormSelect
                            label='Trạng thái'
                            control={control}
                            name=''
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
