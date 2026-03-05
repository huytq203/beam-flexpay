import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { EKYCFilterType } from '../hooks/useConfirmEKYC'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
const STATUS_OPTIONS = [
    { label: 'Đã xác thực', value: 'VERIFIED' },
    { label: 'Đã huỷ', value: 'INVALID' },
]

interface FormSearchProps {
    onSearch: (values: EKYCFilterType) => void
    onReset: () => void
}

const FormSearch = ({ onSearch, onReset }: FormSearchProps) => {
    const formSearch = useForm()

    const handleSubmit = formSearch.handleSubmit((data) => {
        const payload: EKYCFilterType = {
            keyword: data.keyword || undefined,
            status: data.status || undefined,
            createdFrom: data.createdFrom ? dayjs(data.createdFrom).toISOString() : undefined,
            createdTo: data.createdTo ? dayjs(data.createdTo).toISOString() : undefined,
        }
        onSearch(payload)
    })

    const handleReset = () => {
        formSearch.reset()
        onReset()
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-4 gap-3">
                    <FormInput
                        control={formSearch.control}
                        name='keyword'
                        className='col-span-1'
                        label='Từ khoá tìm kiếm'
                        placeholder='Nhập từ khóa ...'
                    />
                    <FormSelect
                        control={formSearch.control}
                        name='status'
                        className='col-span-1'
                        label='Trạng thái'
                        options={STATUS_OPTIONS}
                    />
                    <FormDatePicker
                        control={formSearch.control}
                        name='createdFrom'
                        className='col-span-1'
                        label='Từ ngày'
                        showTime
                    />
                    <FormDatePicker
                        control={formSearch.control}
                        name='createdTo'
                        className='col-span-1'
                        label='Đến ngày'
                        showTime
                    />
                </div>
                <div className="flex justify-end items-center gap-2 mt-3">
                    <ButtonComponent icon={<BroomIcon size={18} />} content='Đặt lại' type='default' onClick={handleReset} />
                    <ButtonComponent icon={<MagnifyingGlassIcon size={18} />} content='Tìm kiếm' htmlType='submit' />
                </div>
            </form>
        </div>
    )
}

export default FormSearch
