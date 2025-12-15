import { ButtonComponent, Table } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import { feePolicies } from '@type/feePolicies'
import { feeDomain, serviceType } from '@type/feePoliciesComponent'
import React from 'react'
import { Control, UseFormHandleSubmit, UseFormReset } from 'react-hook-form'

interface FeeManagementFormProps {
    control: Control<any>
    handleSubmit: UseFormHandleSubmit<any>
    reset: UseFormReset<any>
    handleSearch: (data: feePolicies) => void
    onReset: () => void
    setOpen: (open: boolean) => void
    dataSource: any[]
    columns: any[]
    page: number
    pageSize: number
    total: number
    setPage: (page: number) => void
    setPageSize: (size: number) => void
}

const FeeManagementForm = ({
    handleSubmit,
    handleSearch,
    control,
    reset,
    onReset,
    setOpen,
    dataSource,
    columns,
    page,
    pageSize,
    total,
    setPage,
    setPageSize
}: FeeManagementFormProps) => {
    return (
        <>
            <form
                action=''
                onSubmit={handleSubmit(handleSearch)}
                id='feeManagement'
            >
                <div className='grid grid-cols-12 gap-3'>
                    <FormInput
                        name='keyword'
                        control={control}
                        classNameLable="font-medium"
                        label='Tên chính sách'
                        placeholder='Nhập tên chính sách..'
                    />

                    <FormSelect
                        name='serviceType'
                        control={control}
                        classNameLable="font-medium"
                        label='Loại dịch vụ'
                        defaultValue=''
                        options={[
                            { label: 'Chọn tất cả', value: '' },
                            ...Object.entries(serviceType).map(([key, value]) => ({
                                label: value,
                                value: key
                            }))
                        ]}
                    />
                    <FormSelect
                        name='status'
                        control={control}
                        label='Trạng thái'
                        defaultValue=''
                        options={[
                            { label: 'Chọn tất cả', value: '' },
                            { label: 'INIT', value: 'INIT' },
                            { label: 'ACTIVE', value: 'ACTIVE' },
                            { label: 'INACTIVE', value: 'INACTIVE' },
                            { label: 'LOCKED', value: 'LOCKED' }
                        ]}
                    />

                    <FormSelect
                        name='feeDomain'
                        control={control}
                        label='Phí miền'
                        defaultValue=''
                        options={[
                            { label: 'Chọn tất cả', value: '' },
                            ...Object.entries(feeDomain).map(([key, value]) => ({
                                label: value,
                                value: key
                            }))
                        ]}
                    />

                    <div className=' col-span-12 flex justify-between gap-3 '>
                        <div className='flex gap-2'>
                            <ButtonComponent
                                htmlType='submit'
                                form='feeManagement'
                                icon={
                                    <svg
                                        width={20}
                                        height={20}
                                    >
                                        <use href='/icons.svg#hugeicons-search-01' />
                                    </svg>
                                }
                                content='Search'
                            />
                            <ButtonComponent
                                htmlType='button'
                                content='Xóa bộ lọc'
                                onClick={onReset}
                                type='primary'
                                icon={
                                    <svg
                                        className='pointer-events-none'
                                        width={20}
                                        height={20}
                                    >
                                        <use href='/icons.svg#hugeicons-delete-02' />
                                    </svg>
                                }
                            />
                        </div>
                        <div className=''>
                            <ButtonComponent
                                htmlType='button'
                                content='Thêm chính sách mới'
                                onClick={() => setOpen(true)}
                                type='primary'
                                icon={
                                    <svg
                                        className='pointer-events-none'
                                        width={20}
                                        height={20}
                                    >
                                        <use href='/icons.svg#hugeicons-plus-sign-circle' />
                                    </svg>
                                }
                            />
                        </div>
                    </div>
                </div>
            </form>

            <div className='mt-2'>
                <Table
                    size='small'
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{
                        current: page,
                        showSizeChanger: true,
                        pageSize: pageSize,
                        total: total,
                        onChange: (page, pageSize) => {
                            setPage(page)
                            setPageSize(pageSize)
                        }
                    }}
                />
            </div>
        </>
    )
}

export default FeeManagementForm