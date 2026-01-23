import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormSearch = () => {
    const { control } = useForm()
    return (
        <>
            <form>
                <div className="grid grid-cols-5 gap-3">
                    <FormInput control={control} name='' className='col-span-1' label='Mã đóng băng' />
                    <FormInput control={control} name='' className='col-span-1' label='Khách hàng (Tên/Sđt/Ví)' />
                    <FormSelect control={control} name='' className='col-span-1' label='Trạng thái' options={[]} />
                    <FormInput control={control} name='' className='col-span-1' label='Loại đóng băng' />
                    <FormDatePicker isRange showTime control={control} name='a' className='col-span-1' label='Khoảng ngày' />
                </div>
                <div className="flex justify-end mt-3">
                    <ButtonComponent content={'Tìm kiếm'}/>
                </div>
            </form>
        </>
    )
}

export default FormSearch