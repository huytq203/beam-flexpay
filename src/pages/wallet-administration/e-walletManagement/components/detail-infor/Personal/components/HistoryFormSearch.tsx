import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect, FormDatePicker } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'
import { PaymentMethodLabel, StatusLabel, TransactionLabel, TransactionType } from '../types/HistoryPayment.type'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import * as Icons from '@components/icons'
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
                <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput control={formHistorySearch.control} name='transactionCode' className='col-span-1' label='Mã giao dịch' placeholder='Nhập mã giao dịch...' />
                    <FormSelect control={formHistorySearch.control} name='status' className='col-span-1' options={mapEnumToSelectOptions(StatusLabel)} label='Trạng thái giao dịch' />
                    <FormSelect control={formHistorySearch.control} name='transactionType' className='col-span-1' options={mapEnumToSelectOptions(TransactionLabel)} label='Loại giao dịch' />
                    <FormSelect control={formHistorySearch.control} name='paymentMethod' className='col-span-1' options={mapEnumToSelectOptions(PaymentMethodLabel)} label='Phương thức thanh toán' />
                    <FormDatePicker showTime control={formHistorySearch.control} name='fromDate' className='col-span-1' label='Thời gian từ' />
                    <FormDatePicker showTime control={formHistorySearch.control} name='toDate' className='col-span-1' label='Thời gian đến' />
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