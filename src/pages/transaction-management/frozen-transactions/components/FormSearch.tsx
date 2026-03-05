import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'
import { BroomIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

interface FormSearchValues {
    status?: string
    username?: string
    dateRange?: [string, string]
}

interface FormSearchProps {
    onSearch?: (values: Record<string, unknown>) => void
}

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang đóng băng', value: 'ACTIVE' },
    { label: 'Đã thu', value: 'CAPTURED' },
    { label: 'Đã giải tỏa', value: 'RELEASED' },
    { label: 'Đã hủy', value: 'CANCELLED' },
]

const FormSearch = ({ onSearch }: FormSearchProps) => {
    const { control, handleSubmit, reset } = useForm<FormSearchValues>()

    const onSubmit = (values: FormSearchValues) => {
        const { dateRange, ...rest } = values
        const params: Record<string, unknown> = { ...rest }
        if (dateRange?.[0]) params.fromDate = dateRange[0]
        if (dateRange?.[1]) params.toDate = dateRange[1]
        onSearch?.(params)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormInput control={control} name="username" className="col-span-1" label="Tên tài khoản (username)" placeholder='Nhập tên User...' />
                <FormSelect
                    control={control}
                    name="status"
                    className="col-span-1"
                    label="Trạng thái"
                    options={STATUS_OPTIONS}
                />
                <FormDatePicker isRange showTime control={control} name="dateRange" className="col-span-1" label="Khoảng ngày" />
            </div>
            <div className="flex justify-end mt-3 gap-2">
                <ButtonComponent icon={<BroomIcon size={18} />} type="default" content="Đặt lại" onClick={() => { reset(); onSearch?.({}) }} />
                <ButtonComponent icon={<MagnifyingGlassIcon size={18} />} htmlType="submit" content="Tìm kiếm" />
            </div>
        </form>
    )
}

export default FormSearch