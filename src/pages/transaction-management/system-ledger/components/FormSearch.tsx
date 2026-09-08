import { ButtonComponent } from '@components/index'
import {
    FormDatePicker,
    FormInput,
    FormInputNumber,
    FormLabelHint,
    FormSelect
} from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import * as Icons from '@components/icons'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FormSearchValues } from '../types/SystemLedger.type'
import {
    DirectionLabel,
    LedgerTransactionType,
    OwnerTypeLabels
} from '../constants/SystemLedger.constant'

interface Props {
    handleSearch: (value: FormSearchValues) => void
}

const DEFAULT_VALUES: FormSearchValues = {
    keyword: '',
    transactionCode: '',
    ownerUsername: '',
    ownerType: '',
    glCode: '',
    direction: '',
    transactionType: '',
    minAmount: undefined,
    maxAmount: undefined,
    fromDate: '',
    toDate: ''
}

const TRANSACTION_TYPE_HINT =
    'Sổ cái dùng bộ mã riêng của bảng bút toán, khác bộ mã của màn Quản lý giao dịch (CASH_IN, CASH_OUT, P2P_TRANSFER…). Chọn trong danh sách này để không ra bảng rỗng.'

const TRANSACTION_CODE_HINT =
    'Nhận cả mã giao dịch lẫn UUID của giao dịch. Khớp bằng — gõ đúng toàn bộ mã.'

const KEYWORD_HINT =
    'Khớp chứa trên mã giao dịch và chủ tài khoản. Gõ vài ký tự để lọc dần.'

const FormSearch = ({ handleSearch }: Props) => {
    const formSearch = useForm<FormSearchValues>({
        defaultValues: DEFAULT_VALUES
    })

    const onSubmit: SubmitHandler<FormSearchValues> = (data) => {
        handleSearch(data)
    }

    const handleReset = () => {
        formSearch.reset(DEFAULT_VALUES)
        handleSearch({})
    }

    return (
        <div>
            <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
                <Icons.FunnelIcon /> Bộ lọc tìm kiếm
            </p>
            <form onSubmit={formSearch.handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                    <FormInput
                        control={formSearch.control}
                        name='keyword'
                        label={
                            <FormLabelHint label='Từ khóa' hint={KEYWORD_HINT} />
                        }
                        placeholder='Mã giao dịch hoặc chủ tài khoản...'
                        className='col-span-1'
                    />
                    <FormInput
                        control={formSearch.control}
                        name='transactionCode'
                        label={
                            <FormLabelHint
                                label='Mã giao dịch'
                                hint={TRANSACTION_CODE_HINT}
                            />
                        }
                        placeholder='Nhập mã giao dịch hoặc UUID'
                        className='col-span-1'
                    />
                    <FormInput
                        control={formSearch.control}
                        name='ownerUsername'
                        label='Chủ tài khoản'
                        placeholder='Số điện thoại hoặc username...'
                        className='col-span-1'
                    />
                    <FormSelect
                        control={formSearch.control}
                        name='ownerType'
                        label='Loại chủ tài khoản'
                        options={mapEnumToSelectOptions(OwnerTypeLabels)}
                        placeholder='Tất cả'
                        className='col-span-1'
                    />
                    <FormSelect
                        control={formSearch.control}
                        name='direction'
                        label='Chiều bút toán'
                        options={mapEnumToSelectOptions(DirectionLabel)}
                        placeholder='Tất cả'
                        className='col-span-1'
                    />
                    <FormInput
                        control={formSearch.control}
                        name='glCode'
                        label='Mã tài khoản kế toán (GL)'
                        placeholder='VD: USER_WALLET_VND'
                        className='col-span-1'
                    />
                    <FormSelect
                        control={formSearch.control}
                        name='transactionType'
                        label={
                            <FormLabelHint
                                label='Loại giao dịch'
                                hint={TRANSACTION_TYPE_HINT}
                            />
                        }
                        options={mapEnumToSelectOptions(LedgerTransactionType)}
                        placeholder='Tất cả'
                        className='col-span-1'
                    />
                    <FormInputNumber
                        control={formSearch.control}
                        name='minAmount'
                        label='Số tiền từ'
                        placeholder='Không giới hạn'
                        min={0}
                        allowEmpty
                        className='col-span-1 flex flex-col'
                    />
                    <FormInputNumber
                        control={formSearch.control}
                        name='maxAmount'
                        label='Số tiền đến'
                        placeholder='Không giới hạn'
                        min={0}
                        allowEmpty
                        className='col-span-1 flex flex-col'
                    />
                    <FormDatePicker
                        showTime
                        control={formSearch.control}
                        name='fromDate'
                        label='Ghi sổ từ'
                        className='col-span-1'
                    />
                    <FormDatePicker
                        showTime
                        control={formSearch.control}
                        name='toDate'
                        label='Ghi sổ đến'
                        className='col-span-1'
                    />
                </div>
                <div className='flex justify-end mt-3 gap-1'>
                    <ButtonComponent
                        htmlType='submit'
                        icon={<MagnifyingGlassIcon size={18} />}
                        content={'Tìm kiếm'}
                    />
                    <ButtonComponent
                        onClick={handleReset}
                        type='default'
                        icon={<BroomIcon size={18} />}
                        content={'Xóa lọc'}
                    />
                </div>
            </form>
        </div>
    )
}

export default FormSearch
