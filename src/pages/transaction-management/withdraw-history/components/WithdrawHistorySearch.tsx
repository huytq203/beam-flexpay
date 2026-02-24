import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const WithdrawHistorySearch = () => {
    const { control } = useForm()
    return (
        <div>
            <form className='space-y-3'>
                <div className="grid grid-cols-3 gap-3">
                    <FormInput control={control} name='' className='col-span-1' label='Từ khóa' />
                    <FormDatePicker isRange showTime control={control} name='' className='col-span-1' label='Ngày tạo' />
                    <FormDatePicker isRange showTime control={control} name='' className='col-span-1' label='Ngày rút' />
                    <FormSelect control={control} name='' className='col-span-1' label='Trạng thái' options={[]} />
                    <FormSelect control={control} name='' className='col-span-1' label='NH chi tiền (Hệ thống)' options={[]} />
                    <FormSelect control={control} name='' className='col-span-1' label='Loại giao dịch rút' options={[]} />
                </div>
                <div className=" flex justify-end items-center gap-3">
                    <ButtonComponent content={'Xóa lọc'}/>
                    <ButtonComponent content={'Tìm kiếm'}/>
                </div>
            </form>

        </div>
    )
}

export default WithdrawHistorySearch