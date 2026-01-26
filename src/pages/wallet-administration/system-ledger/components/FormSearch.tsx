import { ButtonComponent } from '@components/index'
import { FormDatePicker, FormInput, FormSelect } from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FormSearchValues } from '../types/SystemLedger.type'
import { StatusLabel, DirectionLabel } from '../constants/SystemLedger.constant'

interface Props {
    handleSearch: (value: FormSearchValues) => void
}

const FormSearch = ({ handleSearch }: Props) => {
    const formSearch = useForm<FormSearchValues>({
        defaultValues: {
            keyword: '',
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

    const statusOptions = Object.entries(StatusLabel).map(([key, value]) => ({
        label: value,
        value: key
    }))

    const directionOptions = Object.entries(DirectionLabel).map(([key, value]) => ({
        label: value,
        value: key
    }))

    return (
        <div>
            <p className='font-medium mb-3'>Tìm kiếm giao dịch sổ cái</p>
            <hr className='my-3' />
            <form>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput
                        control={formSearch.control}
                        name='keyword'
                        label='Tìm kiếm'
                        placeholder='Transaction code, description, GL code, ID...'
                        className='col-span-1 md:col-span-3'
                    />
                    <FormSelect
                        control={formSearch.control}
                        name='status'
                        label='Trạng thái'
                        options={statusOptions}
                        placeholder='Chọn trạng thái'
                        className='col-span-1'
                    />
                    <FormSelect
                        control={formSearch.control}
                        name='direction'
                        label='Hướng'
                        options={directionOptions}
                        placeholder='Chọn hướng'
                        className='col-span-1'
                    />
                    <FormInput
                        control={formSearch.control}
                        name='glCode'
                        label='GL Code'
                        placeholder='Nhập GL Code'
                        className='col-span-1'
                    />
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
