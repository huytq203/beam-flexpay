import { ButtonComponent } from '@components/index'
import {
    FormDatePicker,
    FormInput,
    FormSelect
} from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import * as Icons from '@components/icons'
import { StatusType } from '@pages/wallet-administration/transaction-wallet/constants/Transaction.constant'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { SubmitHandler, useForm } from 'react-hook-form'
import { BankLabel } from '../constants/bank.constant'
import { WithdrawTransactionType } from '../constants/WithdrawHistory.constant'

export interface WithdrawSearchValues {
    journalCode?: string
    transactionCode?: string
    initiatorUsername?: string
    counterpartyUsername?: string
    /** Khớp chứa trên mã GD, mã bút toán, username người khởi tạo và đối tác. */
    keyword?: string
    status?: string
    paymentMethod?: string
    bankCode?: string
    transactionType?: string
    fromDate?: string
    toDate?: string
    /** Thời điểm lệnh rút chuyển sang thành công — khác ngày tạo lệnh. */
    successFrom?: string
    successTo?: string
    minAmount?: number | undefined
    maxAmount?: number | undefined
}

interface Props {
    /** Bộ lọc đang áp (đọc từ URL/bản sao) để ô nhập hiện lại khi quay về màn. */
    defaultValues?: WithdrawSearchValues
    handleSearch: (value: WithdrawSearchValues) => void
    onReset: () => void
}

const PAYMENT_METHOD_OPTIONS = [
    { label: 'Tài khoản ảo', value: 'VA' },
    { label: 'QR Code', value: 'QR_CODE' },
    { label: 'Tài khoản ví', value: 'WALLET_BALANCE' },
    { label: 'Tài khoản liên kết', value: 'LINKED_ACCOUNT' },
]

const DEFAULT_VALUES: WithdrawSearchValues = {
    keyword: '',
    transactionCode: '',
    initiatorUsername: '',
    counterpartyUsername: '',
    status: '',
    paymentMethod: '',
    bankCode: '',
    transactionType: '',
    fromDate: '',
    toDate: '',
    successFrom: '',
    successTo: '',
    minAmount: undefined,
    maxAmount: undefined,
}

const WithdrawHistorySearch = ({ defaultValues, handleSearch, onReset }: Props) => {
    const formSearch = useForm<WithdrawSearchValues>({
        defaultValues: { ...DEFAULT_VALUES, ...defaultValues }
    })

    const onSubmit: SubmitHandler<WithdrawSearchValues> = (data) => {
        handleSearch(data)
    }

    const handleReset = () => {
        formSearch.reset(DEFAULT_VALUES)
        onReset()
    }

    return (
        <div>
            <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
                <Icons.FunnelIcon /> Bộ lọc tìm kiếm
            </p>
            <form onSubmit={formSearch.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput
                        control={formSearch.control}
                        name='keyword'
                        label='Từ khóa'  
                        className='col-span-1'
                        placeholder='Mã GD, khách hàng, số điện thoại...'
                    />
                    <FormInput control={formSearch.control} name='transactionCode' label='Mã giao dịch' className='col-span-1' placeholder='Nhập đúng mã giao dịch...' />
                    <FormSelect control={formSearch.control} name='status' label='Trạng thái' className='col-span-1' options={mapEnumToSelectOptions(StatusType)} placeholder='Tất cả' />
                    <FormSelect control={formSearch.control} name='transactionType' label='Loại giao dịch rút' className='col-span-1' options={mapEnumToSelectOptions(WithdrawTransactionType)} placeholder='Tất cả lệnh rút' />
                    <FormSelect control={formSearch.control} name='bankCode' label='NH thụ hưởng' className='col-span-1' options={mapEnumToSelectOptions(BankLabel)} placeholder='Tất cả' />
                {/* </div> */}
                {/* Bốn ô ngày đi thành hai cặp; tách khỏi lưới 3 cột ở trên để
                    không cặp nào bị vắt sang dòng khác. */}
                {/* <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4"> */}
                    <FormDatePicker showTime control={formSearch.control} name='fromDate' label='Ngày tạo từ' className='col-span-1' />
                    <FormDatePicker showTime control={formSearch.control} name='toDate' label='Ngày tạo đến' className='col-span-1' />
                    <FormDatePicker
                        showTime
                        control={formSearch.control}
                        name='successFrom'
                        label={'Ngày thành công từ'}
                        className='col-span-1'
                    />
                    <FormDatePicker
                        showTime
                        control={formSearch.control}
                        name='successTo'
                        label={'Ngày thành công đến'}
                        className='col-span-1'
                    />
                </div>
                <div className="flex justify-end mt-3 gap-1">
                    <ButtonComponent htmlType='submit' icon={<MagnifyingGlassIcon size={18} />} content={'Tìm kiếm'} />
                    <ButtonComponent onClick={handleReset} type='default' icon={<BroomIcon size={18} />} content={'Xóa lọc'} />
                </div>
            </form>
        </div>
    )
}

export default WithdrawHistorySearch
