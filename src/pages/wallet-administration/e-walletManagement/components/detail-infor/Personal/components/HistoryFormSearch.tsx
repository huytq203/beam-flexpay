import { ButtonComponent } from '@components/index'
import { FormInput, FormSelect, FormDatePicker } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'
import { PaymentMethodLabel, StatusLabel, TransactionLabel } from '../types/HistoryPayment.type'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import * as Icons from '@components/icons'
import type { Dayjs } from 'dayjs'

export interface HistorySearchFormValues {
    transactionCode?: string
    counterpartyUsername?: string
    sourceDomain?: string
    status?: string
    transactionType?: string
    paymentMethod?: string
    fromDate?: Dayjs | null
    toDate?: Dayjs | null
}

interface HistoryFormSearchProps {
    onSearch: (data: HistorySearchFormValues) => void;
}

const HistoryFormSearch = ({ onSearch }: HistoryFormSearchProps) => {
    const formHistorySearch = useForm<HistorySearchFormValues>()

    const onSubmit = (data: HistorySearchFormValues) => {
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="col-span-4 grid grid-cols-4 gap-3">
                        <FormInput control={formHistorySearch.control} name='transactionCode' className='col-span-1' label='Mã giao dịch' placeholder='Nhập mã giao dịch...' />
                        <FormInput control={formHistorySearch.control} name='counterpartyUsername' className='col-span-1'  label='Người nhận' placeholder='Nhập tên/số điện thoại người nhận...' />
                        <FormSelect control={formHistorySearch.control} name='status' className='col-span-1' options={mapEnumToSelectOptions(StatusLabel)} label='Trạng thái giao dịch' />
                        <FormSelect control={formHistorySearch.control} name='transactionType' className='col-span-1' options={mapEnumToSelectOptions(TransactionLabel)} label='Loại giao dịch' />
                    </div>
                    {/* <FormSelect control={formHistorySearch.control} name='sourceDomain' className='col-span-1' options={mapEnumToSelectOptions(SourceDomainLabel)} label='Nguồn' /> */}
                    <div className="col-span-4 grid grid-cols-3 gap-3">
                         <FormSelect control={formHistorySearch.control} name='paymentMethod' className='col-span-1' options={mapEnumToSelectOptions(PaymentMethodLabel)} label='Phương thức thanh toán' />
                        <FormDatePicker showTime control={formHistorySearch.control} name='fromDate' className='col-span-1' label='Thời gian từ' />
                         <FormDatePicker showTime control={formHistorySearch.control} name='toDate' className='col-span-1' label='Thời gian đến' />
                    </div>
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