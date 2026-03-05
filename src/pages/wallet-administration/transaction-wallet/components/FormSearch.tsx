import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormInputNumber, FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { StatusType, TransactionType } from '../constants/Transaction.constant'
import { FormSearchValues } from '../types/Transaction.type'

interface props {
    handleSearch: (value: Partial<FormSearchValues>) => void
}

const PAYMENT_METHOD_OPTIONS = [
    { label: 'ATM', value: 'ATM' },
    { label: 'Credit Card', value: 'CC' },
    { label: 'Virtual Account', value: 'VA' },
    { label: 'QR Code', value: 'QR_CODE' },
    { label: 'Linked Account', value: 'LINKED_ACCOUNT' },
]

const FormSearch = ({ handleSearch }: props) => {
    const formSearch = useForm<FormSearchValues>({
        defaultValues: {
            status: '',
            fromDate: '',
            toDate: '',
            transactionType: '',
            initiatorUsername: '',
            counterpartyUsername: '',
            bankCode: '',
            paymentMethod: '',
            journalCode: '',
            minAmount: undefined,
            maxAmount: undefined,
        }
    })
    const onSubmit: SubmitHandler<FormSearchValues> = (data) => {
        handleSearch(data)
    }

    const handleReset = () => {
        formSearch.reset()
        handleSearch({})
    }
    return (
        <div>
            <form>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput control={formSearch.control} name='journalCode' label='Mã giao dịch' className='col-span-1' placeholder='Nhập mã giao dịch...' />
                    <FormSelect control={formSearch.control} name='transactionType' label='Loại giao dịch' className='col-span-1' options={mapEnumToSelectOptions(TransactionType)} />
                    <FormSelect control={formSearch.control} name='status' label='Trạng thái' className='col-span-1' options={mapEnumToSelectOptions(StatusType)} />
                    <FormInput control={formSearch.control} name='initiatorUsername' label='Người chuyển' className='col-span-1' placeholder='Username người chuyển...' />
                    <FormInput control={formSearch.control} name='counterpartyUsername' label='Người nhận' className='col-span-1' placeholder='Username người nhận...' />
                    <FormInput control={formSearch.control} name='bankCode' label='Mã ngân hàng' className='col-span-1' placeholder='Nhập mã ngân hàng...' />
                    <FormSelect control={formSearch.control} name='paymentMethod' label='Phương thức' className='col-span-1' options={PAYMENT_METHOD_OPTIONS} />
                    <FormInputNumber control={formSearch.control} name='minAmount' label='Số tiền tối thiểu' className='col-span-1' placeholder='Nhập số tiền...' />
                    <FormInputNumber control={formSearch.control} name='maxAmount' label='Số tiền tối đa' className='col-span-1' placeholder='Nhập số tiền...' />
                    <FormDatePicker showTime control={formSearch.control} name='fromDate' label='Thời gian từ' className='col-span-1' />
                    <FormDatePicker showTime control={formSearch.control} name='toDate' label='Thời gian đến' className='col-span-1' />
                </div>
                <div className="flex justify-end mt-3 gap-1">
                    <ButtonComponent onClick={formSearch.handleSubmit(onSubmit)} icon={<MagnifyingGlassIcon size={18} />} content={'Tìm kiếm'} />
                    <ButtonComponent onClick={handleReset} type='default' icon={<BroomIcon size={18} />} content={'Xóa lọc'} />
                </div>
            </form>
        </div>
    )
}

export default FormSearch
