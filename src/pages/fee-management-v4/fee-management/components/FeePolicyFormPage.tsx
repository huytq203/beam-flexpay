import { ButtonComponent, CardComponent, DialogModal, ModalComponent } from '@components/index'
import * as Icons from '@components/icons'
import { useMessage } from '@hooks/useMessage'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getFeeComponentColumns } from '../columns/FeeComponentManagement.columns'
import {
    baseOnEnum,
    baseOnLabel,
    componentType,
    componentTypeLabel,
    statusType
} from '../constants/FeeManagement.constant'
import type { FeePolicyScope } from '../constants/feePolicyScope'
import useFetchDataComponent from '../hooks/useFetchDataComponent'
import useHandleAddFeePolicy from '../hooks/useHandleAddFeePolicy'
import { PolicySchema, PolicyType } from '../schemas/FeeManagement.schema'
import { FeeComponent } from '../types/FeeComponent.types'
import { FeeComponentGroups } from './FeeComponentGroups'
import { FeePolicyFields } from './FeePolicyFields'
import InforPolicy, { InforPolicyRef } from './InforPolicy'

const buildTypeLabels = (dataSource: FeeComponent[] | undefined, seed: Record<string, string>) =>
    dataSource?.reduce((acc: Record<string, string>, item) => {
        if (item.componentType) {
            acc[item.componentType] =
                (componentTypeLabel as Record<string, string>)[item.componentType as componentType] ||
                item.componentType
        }
        return acc
    }, { ...seed })

interface FeePolicyFormPageProps {
    scope: FeePolicyScope
}

export const FeePolicyFormPage = ({ scope }: FeePolicyFormPageProps) => {
    const { mode, id } = useParams()
    const inforPolicyRef = React.useRef<InforPolicyRef>(null)
    const { control, handleSubmit, reset, setValue } = useForm<PolicyType>({
        resolver: zodResolver(PolicySchema),
        defaultValues: {
            status: statusType.INIT
        }
    })
    const [openDialog, setOpenDialog] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<FeeComponent | null>(null)
    const navigate = useNavigate()
    const { errorMess } = useMessage()

    const isCreate = mode === 'create'
    const isEdit = mode === 'edit'

    const {
        handleAdd,
        dataFeePolicyById,
        handleEdit,
        handleDelete,
        isLoadingDeleteFeeComponentPolicies
    } = useHandleAddFeePolicy({ id, setOpenDialog, listPath: scope.listPath })
    const { dataSource, feeComponentLoading } = useFetchDataComponent({ id })
    const status = dataFeePolicyById?.status

    const listBaseOn = useMemo(
        () => buildTypeLabels(dataSource, { [baseOnEnum.AMOUNT]: baseOnLabel[baseOnEnum.AMOUNT] }),
        [dataSource]
    )
    const arrTypeFee = useMemo(() => buildTypeLabels(dataSource, {}), [dataSource])

    const columns = getFeeComponentColumns({
        setOpen,
        setSelectedRow,
        setOpenDialog,
        listBaseOn,
        dataSource,
        errorMess,
        readOnly: !!id && !isEdit
    })

    useEffect(() => {
        if (!dataFeePolicyById) return
        const d = dataFeePolicyById
        reset({
            name: d.name,
            serviceType: d.serviceType,
            feeDomain: d.feeDomain,
            currency: d.currency,
            description: d.description ?? '',
            validFrom: d?.validFrom ? dayjs(d.validFrom).toISOString() : undefined,
            validTo: d?.validTo ? dayjs(d.validTo).toISOString() : undefined,
            status: d.status,
            priority: d.priority
        })
    }, [dataFeePolicyById, reset])

    const handleCloseModal = () => {
        setOpen(false)
        setSelectedRow(null)
    }

    return (
        <div className='space-y-3!'>
            <CardComponent>
                <div className='flex justify-between items-center h-10'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-50 rounded-lg flex items-center justify-center'>
                            <Icons.CreditCardOutlined className='text-blue-600 text-[20px] p-1' />
                        </div>
                        <div>
                            <p className='text-[18px] font-bold text-gray-800 leading-tight'>
                                {isCreate ? `Thêm mới · ${scope.title}` : `Cập nhật · ${scope.title}`}
                            </p>
                            <p className='text-[12px] text-gray-500 font-medium'>
                                {isCreate
                                    ? scope.description
                                    : `Đang chỉnh sửa: ${dataFeePolicyById?.name || id}`}
                            </p>
                        </div>
                    </div>
                    <div className='flex gap-2'>
                        <ButtonComponent
                            onClick={() => navigate(scope.listPath)}
                            icon={<Icons.ArrowLeftOutlined />}
                            type='default'
                        >
                            Trở lại
                        </ButtonComponent>
                        {id && (
                            <ButtonComponent
                                htmlType='submit'
                                form='addNewPolicy'
                                icon={isCreate ? <Icons.PlusCircleOutlined /> : <Icons.SaveOutlined />}
                                hidden={!!id && !isEdit}
                                type='primary'
                            >
                                {isCreate ? 'Thêm mới' : 'Cập nhật'}
                            </ButtonComponent>
                        )}
                    </div>
                </div>
            </CardComponent>

            <CardComponent>
                <div className='flex items-center gap-3 mb-6 pb-3 border-b border-gray-100'>
                    <div className='w-1 h-6 bg-blue-500 rounded-full' />
                    <div className='p-1.5 bg-blue-50 rounded-md'>
                        <Icons.InfoCircleOutlined className='text-blue-500 text-lg' />
                    </div>
                    <span className='text-[17px] font-bold text-gray-800'>
                        1. Thông tin chính sách phí
                    </span>
                </div>
                <form
                    id='addNewPolicy'
                    onSubmit={handleSubmit((data) =>
                        isCreate ? handleAdd(data, isCreate) : handleEdit(data, id)
                    )}
                >
                    <FeePolicyFields
                        control={control}
                        setValue={setValue}
                        isCreate={isCreate}
                        isEdit={isEdit}
                        id={id}
                        status={status}
                        lockedFeeDomain={scope.lockedFeeDomain}
                    />
                    {!id && (
                        <div className='flex justify-end gap-2 mt-6'>
                            <ButtonComponent
                                htmlType='submit'
                                form='addNewPolicy'
                                icon={<Icons.FileDoneOutlined size={18} />}
                            >
                                Lưu cấu hình
                            </ButtonComponent>
                        </div>
                    )}
                </form>
            </CardComponent>

            {id && (
                <CardComponent>
                    <div className='header flex justify-between items-center mb-4 pb-3 border-b border-gray-100'>
                        <div className='flex items-center gap-3'>
                            <div className='w-1 h-6 bg-green-500 rounded-full' />
                            <div className='p-1.5 bg-green-50 rounded-md'>
                                <Icons.ScalesIcon className='text-green-600' size={18} />
                            </div>
                            <div>
                                <span className='text-[17px] font-bold text-gray-800 tracking-tight'>
                                    2. Thành phần phí theo bên hưởng
                                </span>
                                <p className='text-[12px] text-gray-500 font-medium'>
                                    Khoản người dùng trả được chia cho từng bên — mỗi nhóm dưới đây là
                                    một đầu mối đối soát riêng.
                                </p>
                            </div>
                        </div>
                        {isEdit && (
                            <ButtonComponent
                                htmlType='button'
                                content='Thêm thành phần phí'
                                type='primary'
                                onClick={() => {
                                    setOpen(true)
                                    setSelectedRow(null)
                                }}
                                icon={<Icons.PlusCircleOutlined />}
                            />
                        )}
                    </div>
                    <FeeComponentGroups
                        dataSource={dataSource}
                        columns={columns}
                        isLoading={feeComponentLoading}
                    />
                </CardComponent>
            )}

            <ModalComponent
                width='75%'
                open={open}
                title={selectedRow ? 'Sửa thành phần phí' : 'Thêm thành phần phí'}
                onOk={() => inforPolicyRef.current?.handleSave()}
                onCancel={handleCloseModal}
                okText='Xác nhận'
                cancelText='Hủy'
            >
                <InforPolicy
                    ref={inforPolicyRef}
                    policyId={id}
                    onClose={handleCloseModal}
                    selectedRow={selectedRow}
                    listBaseOn={listBaseOn}
                    arrTypeFee={arrTypeFee}
                />
            </ModalComponent>

            <DialogModal
                open={openDialog}
                title='Cảnh báo'
                onOk={() => handleDelete(selectedRow?.id || '')}
                onCancel={() => {
                    setOpenDialog(false)
                    setSelectedRow(null)
                }}
                confirmLoading={isLoadingDeleteFeeComponentPolicies}
                mode='DELETE'
            >
                <div className='flex flex-col items-center justify-center gap-4 py-4'>
                    <Icons.WarningIcon size={48} color='#ff4d4f' weight='fill' />
                    <div className='text-center'>
                        <p className='text-[16px] font-semibold text-red-500'>
                            Bạn có chắc chắn muốn xóa?
                        </p>
                        <p className='text-gray-500 font-medium'>Hành động này không thể hoàn tác.</p>
                    </div>
                </div>
            </DialogModal>
        </div>
    )
}
