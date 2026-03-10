import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'
import { BroomIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

interface FormSearchValues {
    status?: string
    username?: string
    type?: string
    releaseType?: string
    fromDate?: string
    toDate?: string
}

interface FormSearchProps {
    onSearch?: (values: Record<string, unknown>) => void
}

const STATUS_OPTIONS = [
    { label: 'Đang đóng băng', value: 'ACTIVE' },
    { label: 'Đã giải tỏa', value: 'RELEASED' },
]

const FREEZE_TYPE = [
    { label: 'Admin mở thủ công', value: 'MANUAL' },
    { label: 'Hết hạn tự mở', value: 'EXPIRED' },
    { label: 'Hệ thống capture', value: 'CAPTURED' },
]

const RELEASED_TYPE = [
    { label: 'Thủ công', value: 'ADMIN_LOCK' },
    { label: 'Hệ thống hold thanh toán', value: 'PAYMENT' },
    { label: 'Tuân thủ pháp luật', value: 'COMPLIANCE_FREEZE' },
]

const FormSearch = ({ onSearch }: FormSearchProps) => {
    const { control, handleSubmit, reset } = useForm<FormSearchValues>()

    const onSubmit = (values: FormSearchValues) => {
        const { ...rest } = values
        const params: Record<string, unknown> = { ...rest }
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
                <FormSelect
                    control={control}
                    name="type"
                    className="col-span-1"
                    label="Loại đóng băng"
                    options={RELEASED_TYPE}
                />
                <FormSelect
                    control={control}
                    name="releaseType"
                    className="col-span-1"
                    label="Cách mở băng"
                    options={FREEZE_TYPE}
                />
                <FormDatePicker showTime control={control} name="fromDate" className="col-span-1" label="Từ ngày" />
                <FormDatePicker showTime control={control} name="toDate" className="col-span-1" label="Đến ngày" />
            </div>
            <div className="flex justify-end mt-3 gap-2">
                <ButtonComponent icon={<BroomIcon size={18} />} type="default" content="Đặt lại" onClick={() => { reset(); onSearch?.({}) }} />
                <ButtonComponent icon={<MagnifyingGlassIcon size={18} />} htmlType="submit" content="Tìm kiếm" />
            </div>
        </form>
    )
}

export default FormSearch
