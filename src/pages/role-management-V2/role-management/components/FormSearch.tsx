import { ButtonComponent } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ModeAction } from '../hook/useRoleManagement'

export interface SearchFormData {
    roleCode: string
    keyword: string
    status: string
}

interface Props {
    setOpenModalAdd: (value: boolean) => void
    setModeAction: (value: ModeAction) => void
    onSearch?: (data: SearchFormData) => void
}

const FormSearch = ({ setOpenModalAdd, setModeAction, onSearch }: Props) => {
    const { control, handleSubmit, reset } = useForm<SearchFormData>({
        defaultValues: {
            roleCode: '',
            keyword: '',
            status: ''
        }
    })

    const handleSearch = (data: SearchFormData) => {
        onSearch?.(data)
    }

    const handleClearFilter = () => {
        reset()
        onSearch?.({ roleCode: '', keyword: '', status: '' })
    }

    return (
        <>
            <div className='flex w-full gap-3'>
                <form className='flex-1' onSubmit={handleSubmit(handleSearch)}>
                    <div className='grid grid-cols-3 gap-3 w-full'>
                        <FormInput
                            label='Mã quyền'
                            placeholder='Mã quyền...'
                            control={control}
                            name='roleCode'
                            className='col-span-1'
                        />
                        <FormInput
                            label='Tên quyền'
                            placeholder='Tên quyền...'
                            control={control}
                            name='keyword'
                            className='col-span-1'
                        />
                        <FormSelect
                            label='Trạng thái'
                            control={control}
                            name='status'
                            options={[
                                { label: 'Tất cả', value: '' },
                                { label: 'Hoạt động', value: 'ACTIVE' },
                                { label: 'Không hoạt động', value: 'INACTIVE' }
                            ]}
                            className='col-span-1'
                        />
                    </div>
                    {/* Hidden submit button to enable Enter key submission */}
                    <button type='submit' className='hidden' />
                </form>

                <div className='flex items-end gap-1'>
                    <ButtonComponent content='Tìm kiếm' onClick={handleSubmit(handleSearch)} />
                    <ButtonComponent content='Thêm mới' onClick={() => {
                        setOpenModalAdd(true)
                        setModeAction('add')
                    }} />
                    <ButtonComponent content='Xóa lọc' onClick={handleClearFilter} />
                </div>
            </div>
        </>
    )
}

export default FormSearch
