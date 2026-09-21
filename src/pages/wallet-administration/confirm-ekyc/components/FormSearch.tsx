import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { EKYCFilterType } from '../hooks/useConfirmEKYC'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import * as Icons from '@components/icons'

const STATUS_OPTIONS = [
    { label: 'Đã xác thực', value: 'VERIFIED' },
    { label: 'Thành công', value: 'COMPLETED' },
    { label: 'Đã huỷ', value: 'INVALID' },
    { label: 'Đang xử lý', value: 'IN_PROGRESS' },
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
            createdFrom: data.createdFrom ? dayjs.utc(data.createdFrom).format('YYYY-MM-DD HH:mm:ss') : undefined,
            createdTo: data.createdTo ? dayjs.utc(data.createdTo).format('YYYY-MM-DD HH:mm:ss') : undefined,
        }
        onSearch(payload)
    })

    const handleReset = () => {
        formSearch.reset()
        onReset()
    }

    return (
        <div>
            <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'> <Icons.FunnelIcon /> Bộ lọc tìm kiếm</p>
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
                        label='Ngày tạo từ'
                        showTime
                    />
                    <FormDatePicker
                        control={formSearch.control}
                        name='createdTo'
                        className='col-span-1'
                        label='Ngày tạo đến'
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
