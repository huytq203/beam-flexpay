import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'

interface FormSearchValues {
    id?: string
    keyword?: string
    status?: string
    type?: string
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
            <div className="grid grid-cols-5 gap-3">
                <FormInput control={control} name="id" className="col-span-1" label="Mã đóng băng" />
                <FormInput control={control} name="keyword" className="col-span-1" label="Khách hàng (Tên/SĐT/Ví)" />
                <FormSelect
                    control={control}
                    name="status"
                    className="col-span-1"
                    label="Trạng thái"
                    options={STATUS_OPTIONS}
                />
                <FormInput control={control} name="type" className="col-span-1" label="Loại đóng băng" />
                <FormDatePicker isRange showTime control={control} name="dateRange" className="col-span-1" label="Khoảng ngày" />
            </div>
            <div className="flex justify-end mt-3 gap-2">
                <ButtonComponent type="default" content="Đặt lại" onClick={() => { reset(); onSearch?.({}) }} />
                <ButtonComponent htmlType="submit" content="Tìm kiếm" />
            </div>
        </form>
    )
}

export default FormSearch