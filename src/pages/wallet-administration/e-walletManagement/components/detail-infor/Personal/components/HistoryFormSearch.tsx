import { ButtonComponent } from '@components/common'
import { FormInput, FormSelect, FormDatePicker } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const HistoryFormSearch = () => {
    const formHistorySearch = useForm()
    return (
        <div>
            <form>
                <p className='mb-3'>Bộ lọc tìm kiếm</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput control={formHistorySearch.control} name='' className='col-span-1' label='Mã giao dịch'/>
                    <FormSelect control={formHistorySearch.control} name='' className='col-span-1' options={[]}  label='Trạng thái giao dịch'/>
                    <FormSelect control={formHistorySearch.control} name='' className='col-span-1' options={[]}  label='Loại giao dịch' />
                    <FormSelect control={formHistorySearch.control} name='' className='col-span-1' options={[]}  label='Trạng thái đóng băng'/>
                    <FormDatePicker isRange showTime control={formHistorySearch.control} name='date2' className='col-span-1'  label='Thời gian tạo'/>
                    <FormDatePicker isRange control={formHistorySearch.control} name='date1' className='col-span-1'  label='Thời gian thành công'/>
                </div>
                <div className="flex justify-end mt-3">
                    <ButtonComponent content={'Tìm kiếm'} />
                </div>
            </form>
        </div>
    )
}

export default HistoryFormSearch