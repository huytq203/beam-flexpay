import { FormDatePicker, FormInput, FormInputNumber, FormSelect, FormTextArea } from '@components/form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Currency, feeDomain, serviceType, STATUS_LABEL, statusType } from './constants/FeeManagement.constant'
import { ButtonComponent, CardComponent, ModalComponent, Table } from '@components/index'
import * as Icons from '@components/icons'
import useHandle from './hooks/useHandle'
import { FeePolicyFormValues } from './utils/FeeManagement.type'
import { useNavigate, useParams } from 'react-router-dom'
import InforPolicy from './components/InforPolicy'
import { getFeeComponentColumns } from './columns/FeeComponentManagement.columns'
import useFetchDataComponent from './hooks/useFetchDataComponent'
import { FeeComponent } from './types/FeeComponent.types'
import { FeePolicy } from '@pages/fee-management-v3/fee-management/types/FeeManagement.types'
import { PATHS } from '@constants/pathConstant'

const AddFeePolicy = () => {
    const { mode, id } = useParams()
    const inforPolicyRef = React.useRef<any>(null)
    const { control, handleSubmit, reset } = useForm<FeePolicyFormValues>()
    const [isCreate, setIsCreate] = useState(true)
    const [isEdit, setIsEdit] = useState(false)
    const [open, setOpen] = useState(false)
    const { handleAdd, dataFeePolicyById,handleEdit } = useHandle({ id })
    const [selectedRow, setSelectedRow] = useState<FeeComponent | null>(null)
    const navigate = useNavigate()
    const columns = getFeeComponentColumns({
        setOpen,
        setSelectedRow
    })
    const { dataSource, feeComponentLoading, page, pageSize, setPage, setPageSize, total } = useFetchDataComponent({ id })

    useEffect(() => {
        setIsCreate(mode === "create");
        setIsEdit(mode === "edit");
    }, [mode]);


    useEffect(() => {
        if (dataFeePolicyById) {
            const d = dataFeePolicyById
            reset({
                name: d.name,
                serviceType: d.serviceType,
                feeDomain: d.feeDomain,
                currency: d.currency,
                description: d.description ?? '',
                validFrom: d.validFrom ?? undefined,
                validTo: d.validTo ?? undefined,
                status: d.status,
                priority: d.priority,
            })
        }
    }, [dataFeePolicyById])
    const handleCloseModal = () => {
        setOpen(false)
        setSelectedRow(null)
    }
    return (
        <div className='space-y-3'>
            <CardComponent>
                <div className="flex justify-between">
                    <p>Cập nhật chính sách phí</p>
                    <div className="flex gap-2">
                        <ButtonComponent
                            onClick={() => navigate(PATHS.FEE_V4.FEE_MANAGEMENT)}
                            icon={<Icons.ArrowLeftOutlined />}
                            type='default'
                        >
                            Trở lại
                        </ButtonComponent>
                        {
                            id && <ButtonComponent
                                htmlType='submit'
                                form='addNewPolicy'
                                icon={isCreate ? <Icons.PlusCircleOutlined /> : <Icons.SaveOutlined />}
                                hidden={!!id && !isEdit}
                            >
                                {isCreate ? 'Thêm mới' : 'Cập nhật'}
                            </ButtonComponent>
                        }
                    </div>
                </div>

            </CardComponent>
            <CardComponent>
                <p className='text-[16px] font-semibold mb-3'>1. Thông tin chính sách phí</p>
                <form id='addNewPolicy' onSubmit={handleSubmit((data) => isCreate? handleAdd(data, isCreate):handleEdit(data,id))}>
                    <div className='grid grid-cols-12 gap-2'>
                        <FormInput
                            name='name'
                            control={control}
                            label={!isCreate ? 'Tên chính sách phí' : <span>Tên chính sách phí <span className='text-red'>(*)</span> </span>}
                            placeholder='Nhập tên chính sách...'
                            className='col-span-12 md:col-span-6'
                            disabled={!!id &&isCreate||!!id&&isEdit }

                        />
                        <FormInputNumber
                            className='col-span-12 md:col-span-6'
                            name='priority'
                            control={control}
                            label={!isCreate ? 'Mức độ ưu tiên' : <span>Mức độ ưu tiên <span className='text-red'>(*)</span></span>}
                            placeholder='Nhập mức độ ưu tiên'
                            disabled={!!id && !isEdit ||!!id&&isCreate}

                        />

                        <FormDatePicker
                            className='col-span-12 md:col-span-6 flex flex-col'
                            name='validFrom'
                            control={control}
                            label={!isCreate ? 'Hiệu lực từ' : <span>Hiệu lực từ <span className='text-red'>(*)</span></span>}
                            showTime
                            disabledDate={(current: Dayjs) =>
                                current && current < dayjs().startOf('day')
                            }
                            disabled={!!id && !isEdit||!!id&&isCreate}

                        />
                        <FormDatePicker
                            className='col-span-12 md:col-span-6 flex flex-col'
                            name='validTo'
                            control={control}
                            label={!isCreate ? 'Hiệu lực đến' : <span>Hiệu lực đến </span>}
                            showTime
                            disabled={!!id && !isEdit||!!id&&isCreate}
                        />

                        <FormSelect
                            className='col-span-12 md:col-span-6'
                            name='status'
                            control={control}
                            label={!isCreate ? 'Trạng thái hoạt động' : <span>Trạng thái hoạt động <span className='text-red'>(*)</span></span>}
                            options={
                                isCreate ? mapEnumToSelectOptions(STATUS_LABEL).slice(0, 1) :
                                    mapEnumToSelectOptions(STATUS_LABEL)

                            }
                            disabled={!!id && !isEdit}

                        />

                        <FormSelect
                            className='col-span-12 md:col-span-6'
                            name='serviceType'
                            control={control}
                            label={!isCreate ? "Loại dịch vụ" : <span>Loại dịch vụ <span className='text-red'>(*)</span></span>}
                            options={mapEnumToSelectOptions(serviceType)}
                            disabled={!!id && !isEdit}

                        />
                        <FormSelect
                            className='col-span-12 md:col-span-6'
                            name='currency'
                            control={control}
                            options={mapEnumToSelectOptions(Currency)}
                            label={!isCreate ? "Đơn vị thanh toán" : <span>Đơn vị thanh toán <span className='text-red'>(*)</span></span>}
                            placeholder='Nhập đơn vị thanh toán...'
                            disabled={!!id && !isEdit}

                        />

                        <FormSelect
                            className='col-span-12 md:col-span-6'
                            name='feeDomain'
                            control={control}
                            label={!isCreate ? "Phí miền" : <span>Phí miền <span className='text-red'>(*)</span></span>}
                            options={mapEnumToSelectOptions(feeDomain)}
                            disabled={!!id && !isEdit}

                        />

                        <FormTextArea
                            className='col-span-12 md:col-span-12'
                            name='description'
                            control={control}
                            label={!isCreate ? 'Mô tả' : <span>Mô tả </span>}
                            placeholder='Nhập mô tả chính sách...'
                            disabled={!!id && !isEdit}
                        />
                    </div>
                    {!id && <div className='flex justify-end gap-2 mt-6 '>
                        <ButtonComponent
                            htmlType='submit'
                            form='addNewPolicy'
                            icon={<Icons.PlusCircleOutlined />}
                            hidden={!!id && !isEdit}
                        >
                            {isCreate ? 'Thêm mới' : 'Cập nhật'}
                        </ButtonComponent>
                    </div>}
                </form>
            </CardComponent>
            {id &&
                <CardComponent >
                    <div className='bg-white rounded '>
                        <div className='header flex justify-between items-center'>
                            <p className='text-[16px] font-semibold'>
                                2. Danh sách thành phần phí (Components)
                            </p>
                            <ButtonComponent
                                htmlType='button'
                                content='Thêm thành phần phí'
                                type='primary'
                                onClick={() => setOpen(true)}
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
                        <div className=''>
                            <Table
                                columns={columns}
                                dataSource={dataSource}
                                size='small'
                                pagination={{
                                    current: page,
                                    pageSize: pageSize,
                                    total: total,
                                    showSizeChanger: true,
                                    onChange: (newPage, newPageSize) => {
                                        setPage(newPage)
                                        setPageSize(newPageSize)
                                    },
                                    showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} bản ghi`
                                }}

                            />
                            {/* <ModalComponent
                              width="75%"
                              title={selectedRow ? 'Sửa thành phần phí' : 'Thêm thành phần phí'}
                              open={open}
                              onOk={handleSaveAddFee}
                              onCancel={handleCloseModal}
                              confirmLoading={isSubmitting}
                              modalText={
                                <InforPolicy
                                  ref={infoPolicyRef}
                                  selectedRow={selectedRow}
                                  combinedInitialData={combinedInitialData}
                                  onSubmit={handleFormSubmit}
                                  onUpdate={handleUpdateFeeComponent}
                                  onSuccess={handleModalSuccess}
                                  arrListBaseOn={arrListBaseOn}
                                />
                              }
                              loading={loadingFeeComponentById}
                            /> */}
                        </div>
                    </div>
                </CardComponent>
            }
            <ModalComponent
                width="75%"
                open={open}
                title='Thêm thành phần phí'
                onOk={() => inforPolicyRef.current?.handleSave()}
                onCancel={handleCloseModal}
            >
                <InforPolicy ref={inforPolicyRef} policyId={id} onClose={handleCloseModal} selectedRow={selectedRow}/>
            </ModalComponent>
        </div>
    )
}

export default AddFeePolicy
