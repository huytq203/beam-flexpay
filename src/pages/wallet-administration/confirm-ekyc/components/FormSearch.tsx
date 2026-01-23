import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const FormSearch = () => {
    const formSearch = useForm()
    return (
        <div>
            <form>
                <div className="grid grid-cols-3 gap-3">
                    <FormInput control={formSearch.control} name='' className='col-span-1' label='Tìm kiếm từ khóa' />
                    <FormSelect control={formSearch.control} name='' className='col-span-1' label='Loại thài khoản' options={[]} />
                    <FormSelect control={formSearch.control} name='' className='col-span-1' label='Trạng thái' options={[]} />
                    <FormSelect control={formSearch.control} name='' className='col-span-1' label='AI Score' options={[]} />
                    <FormDatePicker isRange showTime control={formSearch.control} name='' className='col-span-1' label='Ngày gửi' />
                    <FormDatePicker isRange showTime control={formSearch.control} name='' className='col-span-1' label='Ngày xác thực' />

                </div>
                <div className="flex justify-end items-center mt-3">
                    <ButtonComponent content='Tìm kiếm' />
                </div>

            </form>
        </div>
    )
}

export default FormSearch