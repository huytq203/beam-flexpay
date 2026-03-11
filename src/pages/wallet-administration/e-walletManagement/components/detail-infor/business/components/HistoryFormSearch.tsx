import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect, FormDatePicker } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'
import { StatusLabel, TransactionType } from '../types/HistoryPayment.type'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'

interface HistoryFormSearchProps {
    onSearch: (data: any) => void;
}

const HistoryFormSearch = ({ onSearch }: HistoryFormSearchProps) => {
    const formHistorySearch = useForm()

    const onSubmit = (data: any) => {
        onSearch(data);
    }

    const resetForm = () => {
        formHistorySearch.reset();
        onSearch({});
    }

    return (
        <div>
            <form onSubmit={formHistorySearch.handleSubmit(onSubmit)}>
                <p className='mb-3 font-bold '>Bộ lọc tìm kiếm</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <FormSelect control={formHistorySearch.control} name='status' className='col-span-1' options={mapEnumToSelectOptions(StatusLabel)} label='Trạng thái giao dịch' />
                    <FormSelect control={formHistorySearch.control} name='type' className='col-span-1' options={mapEnumToSelectOptions(TransactionType)} label='Loại giao dịch' />
                    <FormDatePicker showTime control={formHistorySearch.control} name='fromDate' className='col-span-1' label='Thời gian từ' />
                    <FormDatePicker showTime control={formHistorySearch.control} name='toDate' className='col-span-1' label='Thời gian thành đến' />
                </div>
                <div className="flex justify-end mt-3">
                    <ButtonComponent type='default' onClick={resetForm} content={'Đặt lại'} />
                    <ButtonComponent htmlType='submit' className='ml-2' content={'Tìm kiếm'} />
                </div>
            </form>
        </div>
    )
}

export default HistoryFormSearch