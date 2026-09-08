import { ButtonComponent } from '@components/index'
import {
    FormDatePicker,
    FormInput,
    FormLabelHint,
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
    handleSearch: (value: WithdrawSearchValues) => void
}

const PAYMENT_METHOD_OPTIONS = [
    { label: 'Thẻ ATM', value: 'ATM' },
    { label: 'Thẻ tín dụng', value: 'CC' },
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

const KEYWORD_HINT =
    'Khớp chứa, không phân biệt hoa thường, trên mã giao dịch · mã bút toán · số điện thoại người rút · số điện thoại đối tác. Gõ vài ký tự để lọc dần, khác ô Mã giao dịch vốn khớp bằng.'

const SUCCESS_DATE_HINT =
    'Thời điểm lệnh rút chuyển sang thành công, khác ngày tạo lệnh ở trên. Lệnh tạo cuối tháng nhưng chi sang đầu tháng sau sẽ rơi vào hai khoảng khác nhau.'

const WithdrawHistorySearch = ({ handleSearch }: Props) => {
    const formSearch = useForm<WithdrawSearchValues>({
        defaultValues: DEFAULT_VALUES
    })

    const onSubmit: SubmitHandler<WithdrawSearchValues> = (data) => {
        handleSearch(data)
    }

    const handleReset = () => {
        formSearch.reset(DEFAULT_VALUES)
        handleSearch(DEFAULT_VALUES)
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
                        label={<FormLabelHint label='Từ khóa' hint={KEYWORD_HINT} />}
                        className='col-span-1'
                        placeholder='Mã GD, khách hàng, số điện thoại...'
                    />
                    <FormInput control={formSearch.control} name='transactionCode' label='Mã giao dịch' className='col-span-1' placeholder='Nhập đúng mã giao dịch...' />
                    <FormSelect control={formSearch.control} name='status' label='Trạng thái' className='col-span-1' options={mapEnumToSelectOptions(StatusType)} placeholder='Tất cả' />
                    <FormSelect control={formSearch.control} name='transactionType' label='Loại giao dịch rút' className='col-span-1' options={mapEnumToSelectOptions(WithdrawTransactionType)} placeholder='Tất cả lệnh rút' />
                    <FormSelect control={formSearch.control} name='paymentMethod' label='Phương thức' className='col-span-1' options={PAYMENT_METHOD_OPTIONS} placeholder='Tất cả' />
                    <FormSelect control={formSearch.control} name='bankCode' label='NH chi tiền (Hệ thống)' className='col-span-1' options={mapEnumToSelectOptions(BankLabel)} placeholder='Tất cả' />
                </div>
                {/* Bốn ô ngày đi thành hai cặp; tách khỏi lưới 3 cột ở trên để
                    không cặp nào bị vắt sang dòng khác. */}
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <FormDatePicker showTime control={formSearch.control} name='fromDate' label='Ngày tạo từ' className='col-span-1' />
                    <FormDatePicker showTime control={formSearch.control} name='toDate' label='Ngày tạo đến' className='col-span-1' />
                    <FormDatePicker
                        showTime
                        control={formSearch.control}
                        name='successFrom'
                        label={<FormLabelHint label='Ngày thành công từ' hint={SUCCESS_DATE_HINT} />}
                        className='col-span-1'
                    />
                    <FormDatePicker
                        showTime
                        control={formSearch.control}
                        name='successTo'
                        label={<FormLabelHint label='Ngày thành công đến' hint={SUCCESS_DATE_HINT} />}
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
