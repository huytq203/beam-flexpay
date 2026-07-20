import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FormSearchValues } from '../types/SystemLedger.type'
import * as Icons from '@components/icons'
interface Props {
    handleSearch: (value: FormSearchValues) => void
}

const FormSearch = ({ handleSearch }: Props) => {
    const formSearch = useForm<FormSearchValues>({
        defaultValues: {
            transactionId: '',
            accountId: '',
            status: '',
            direction: '',
            glCode: '',
            fromDate: '',
            toDate: ''
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
            <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
            <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                        control={formSearch.control}
                        name='transactionId'
                        label='Mã giao dịch'
                        placeholder='Nhập mã giao dịch'
                        className='col-span-1 md:col-span-1'
                    />
                    <FormInput
                        control={formSearch.control}
                        name='accountId'
                        label='Mã tài khoản'
                        placeholder='Nhập mã tài khoản'
                        className='col-span-1 md:col-span-1'
                    />
                    {/* <FormSelect
                        control={formSearch.control}
                        name='status'
                        label='Trạng thái'
                        options={mapEnumToSelectOptions(StatusLabel)}
                        placeholder='Chọn trạng thái'
                        className='col-span-1'
                    />
                    <FormSelect
                        control={formSearch.control}
                        name='direction'
                        label='Hướng'
                        options={mapEnumToSelectOptions(DirectionLabel)}
                        placeholder='Chọn hướng'
                        className='col-span-1'
                    />
                    <FormInput
                        control={formSearch.control}
                        name='glCode'
                        label='GL Code'
                        placeholder='Nhập GL Code'
                        className='col-span-1'
                    /> */}
                    <FormDatePicker
                        showTime
                        control={formSearch.control}
                        name='fromDate'
                        label='Thời gian từ'
                        className='col-span-1'
                    />
                    <FormDatePicker
                        showTime
                        control={formSearch.control}
                        name='toDate'
                        label='Thời gian đến'
                        className='col-span-1'
                    />
                </div>
                <div className="flex justify-end mt-3 gap-1">
                    <ButtonComponent
                        onClick={formSearch.handleSubmit(onSubmit)}
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
