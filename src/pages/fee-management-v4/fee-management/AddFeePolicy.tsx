import { FormDatePicker, FormInput, FormInputNumber, FormSelect, FormTextArea } from '@components/form'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Currency, feeDomain, serviceType, statusType } from './constants/FeeManagement.constant'
import { ButtonComponent, CardComponent, ModalComponent, Table } from '@components/index'
import * as Icons from '@components/icons'
import useHandle from './hooks/useHandle'
import { FeePolicyFormValues } from './types/FeeManagement.type'
import { useParams } from 'react-router-dom'
import InforPolicy from './components/InforPolicy'

const AddFeePolicy = () => {
    const { id } = useParams()
    const { control, handleSubmit, reset } = useForm<FeePolicyFormValues>()
    const [isCreate, setIsCreate] = useState(true)
    const { handleAdd, dataFeePolicyById } = useHandle({ id })
    useEffect(() => {
        if (dataFeePolicyById) {
            const d = dataFeePolicyById
            reset({
                name: d.name,
                serviceType: d.serviceType,
                feeDomain: d.feeDomain,
                currency: d.currency,
                description: d.description ?? '',
                validFrom: d.validFrom ? (dayjs(d.validFrom) as any) : undefined,
                validTo: d.validTo ? (dayjs(d.validTo) as any) : undefined,
                status: d.status,
                priority: d.priority,
            })
        }
    }, [dataFeePolicyById])

    return (
        <>
            <CardComponent>
                <form id='addNewPolicy' onSubmit={handleSubmit(handleAdd)}>
                    <div className='grid grid-cols-12 gap-2'>
                        <FormInput
                            name='name'
                            control={control}
                            label={!isCreate ? 'Tên chính sách phí' : <span>Tên chính sách phí <span className='text-red'>(*)</span> </span>}
                            placeholder='Nhập tên chính sách...'
                            className='col-span-12 md:col-span-6'
                            disabled={!!id}

                        />
                        <FormInputNumber
                            className='col-span-12 md:col-span-6'
                            name='priority'
                            control={control}
                            label={!isCreate ? 'Mức độ ưu tiên' : <span>Mức độ ưu tiên <span className='text-red'>(*)</span></span>}
                            placeholder='Nhập mức độ ưu tiên'
                            disabled={!!id}

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
                            disabled={!!id}

                        />
                        <FormDatePicker
                            className='col-span-12 md:col-span-6 flex flex-col'
                            name='validTo'
                            control={control}
                            label={!isCreate ? 'Hiệu lực đến' : <span>Hiệu lực đến </span>}
                            showTime
                            disabled={!!id}
                        />

                        <FormSelect
                            className='col-span-12 md:col-span-6'
                            name='status'
                            control={control}
                            label={!isCreate ? 'Trạng thái hoạt động' : <span>Trạng thái hoạt động <span className='text-red'>(*)</span></span>}
                            options={
                                isCreate ? mapEnumToSelectOptions(statusType).slice(0, 1) :
                                    mapEnumToSelectOptions(statusType)

                            }
                            disabled={!!id}

                        />

                        <FormSelect
                            className='col-span-12 md:col-span-6'
                            name='serviceType'
                            control={control}
                            label={!isCreate ? "Loại dịch vụ" : <span>Loại dịch vụ <span className='text-red'>(*)</span></span>}
                            options={mapEnumToSelectOptions(serviceType)}
                            disabled={!!id}

                        />
                        <FormSelect
                            className='col-span-12 md:col-span-6'
                            name='currency'
                            control={control}
                            options={mapEnumToSelectOptions(Currency)}
                            label={!isCreate ? "Đơn vị thanh toán" : <span>Đơn vị thanh toán <span className='text-red'>(*)</span></span>}
                            placeholder='Nhập đơn vị thanh toán...'
                            disabled={!!id}

                        />

                        <FormSelect
                            className='col-span-12 md:col-span-6'
                            name='feeDomain'
                            control={control}
                            label={!isCreate ? "Phí miền" : <span>Phí miền <span className='text-red'>(*)</span></span>}
                            options={mapEnumToSelectOptions(feeDomain)}
                            disabled={!!id}

                        />

                        <FormTextArea
                            className='col-span-12 md:col-span-12'
                            name='description'
                            control={control}
                            label={!isCreate ? 'Mô tả' : <span>Mô tả </span>}
                            placeholder='Nhập mô tả chính sách...'
                            disabled={!!id}
                        />
                    </div>
                    <div className='flex justify-end gap-2 mt-2 '>
                        <ButtonComponent
                            htmlType='submit'
                            form='addNewPolicy'
                            icon={<Icons.PlusCircleOutlined />}
                            disabled={!!id}
                        >
                            {isCreate ? 'Thêm mới' : 'Cập nhật'}
                        </ButtonComponent>
                    </div>
                </form>
            </CardComponent>
            {id &&
                <CardComponent className='mt-3'>
                    <div className='bg-white rounded '>
                        <div className='header flex justify-between items-center'>
                            <p className='text-[16px] font-semibold'>
                                2. Danh sách thành phần phí (Components)
                            </p>
                            <ButtonComponent
                                htmlType='button'
                                content='Thêm thành phần phí'
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
                        <div className=''>
                            <Table
                            //   columns={columns}
                            //   dataSource={dataSource}
                            //   size='small'
                            //   bordered
                            //   pagination={{
                            //     current: page,
                            //     pageSize: pageSize,
                            //     total: total,
                            //     showSizeChanger: true,
                            //     onChange: (newPage, newPageSize) => {
                            //       setPage(newPage)
                            //       setPageSize(newPageSize)
                            //     },
                            //     showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} bản ghi`
                            //   }}

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
                open={true}
                title='Thêm thành phần phí'
                onOk={() => { }}
                onCancel={() => { }}
                footer={null}
            >
                <InforPolicy policyId={id} />
            </ModalComponent>
        </>
    )
}

export default AddFeePolicy
