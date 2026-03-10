import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormInputNumber, FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { PaymentMethod, StatusType } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'

export interface WithdrawSearchValues {
    journalCode: string
    initiatorUsername: string
    counterpartyUsername: string
    status: string
    paymentMethod: string
    bankCode: string
    fromDate: string
    toDate: string
    minAmount: number | undefined
    maxAmount: number | undefined
}

interface Props {
    handleSearch: (value: Partial<WithdrawSearchValues>) => void
}

const PAYMENT_METHOD_OPTIONS = [
    { label: 'Thẻ ATM', value: 'ATM' },
    { label: 'Thẻ tín dụng', value: 'CC' },
    { label: 'Tài khoản ảo', value: 'VA' },
    { label: 'QR Code', value: 'QR_CODE' },
    { label: 'Tài khoản ví', value: 'WALLET_BALANCE' },
    { label: 'Tài khoản liên kết', value: 'LINKED_ACCOUNT' },
]

const WithdrawHistorySearch = ({ handleSearch }: Props) => {
    const formSearch = useForm<WithdrawSearchValues>({
        defaultValues: {
            journalCode: '',
            initiatorUsername: '',
            counterpartyUsername: '',
            status: '',
            paymentMethod: '',
            bankCode: '',
            fromDate: '',
            toDate: '',
            minAmount: undefined,
            maxAmount: undefined,
        }
    })

    const onSubmit: SubmitHandler<WithdrawSearchValues> = (data) => {
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
                    {/* <FormInput control={formSearch.control} name='initiatorUsername' label='Người yêu cầu' className='col-span-1' placeholder='Username người yêu cầu...' /> */}
                    {/* <FormInput control={formSearch.control} name='counterpartyUsername' label='Thụ hưởng' className='col-span-1' placeholder='Username thụ hưởng...' /> */}
                    <FormSelect control={formSearch.control} name='status' label='Trạng thái' className='col-span-1' options={mapEnumToSelectOptions(StatusType)} />
                    <FormSelect control={formSearch.control} name='paymentMethod' label='Phương thức' className='col-span-1' options={PAYMENT_METHOD_OPTIONS} />
                    <FormInput control={formSearch.control} name='bankCode' label='Mã ngân hàng' className='col-span-1' placeholder='VD: VCB, TCB...' />
                    {/* <FormInputNumber control={formSearch.control} name='minAmount' label='Số tiền tối thiểu' className='col-span-1' placeholder='Nhập số tiền...' />
                    <FormInputNumber control={formSearch.control} name='maxAmount' label='Số tiền tối đa' className='col-span-1' placeholder='Nhập số tiền...' /> */}
                    <FormDatePicker showTime control={formSearch.control} name='fromDate' label='Từ ngày' className='col-span-1' />
                    <FormDatePicker showTime control={formSearch.control} name='toDate' label='Đến ngày' className='col-span-1' />
                </div>
                <div className="flex justify-end mt-3 gap-1">
                    <ButtonComponent onClick={formSearch.handleSubmit(onSubmit)} icon={<MagnifyingGlassIcon size={18} />} content={'Tìm kiếm'} />
                    <ButtonComponent onClick={handleReset} type='default' icon={<BroomIcon size={18} />} content={'Xóa lọc'} />
                </div>
            </form>
        </div>
    )
}

export default WithdrawHistorySearch