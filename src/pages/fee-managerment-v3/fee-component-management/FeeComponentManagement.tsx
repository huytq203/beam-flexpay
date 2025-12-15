import React, { useState, useEffect, useRef, useMemo } from 'react'
import { feeComponentColumns } from './FeeComponentManagement.columns'
import { feePolicyComponent } from '@type/feePoliciesComponent'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  PolicySchema,
  PolicyType,
  FeeComponentType
} from '../FeeManagement.schema'
import {
  ModalComponent,
  ButtonComponent,
  DialogModal,
  Table
} from '@components/common'
import FormAddFeeComponent from '@pages/fee-managerment-v3/components/FormAddFeeComponent'
import {
  useGetFeeComponentByIdQuery,
  useGetFeeComponentPoliciesByIdQuery,
  useGetFeeComponentPoliciesQuery
} from '@services/apiFeeComponent'
import { useNavigate, useParams } from 'react-router-dom'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'
import {
  useGetFeePolicyByIdQuery,
  usePostNewPolicyMutation,
  usePutFeePolicyMutation
} from '@services/apiFeePoliciesServices'
import FormAddPolicy from '../components/FormAddPolicy'
import { useGetFeeComponentTierQuery } from '@services/apiFeeComponentTier'
import { useMessage } from '@hooks/useMessage'
import { convertToISO } from '../FeeManagement.utils'
import { useFeeComponentForm } from '../hooks/useFeeComponentForm'

const FeeComponentManagement = () => {
  const { successMess, errorMess } = useMessage()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  // UI State
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRow, setSelectedRow] = useState<feePolicyComponent | null>(
    null
  )

  // Form ref
  const formRef = useRef<{
    submit: () => void
    update: () => void
    reset: () => void
    submitAllTiers: (feeComponentId?: string) => Promise<void>
    updateAllTiers: () => Promise<void>
  }>(null)

  // Custom hook for fee component CRUD
  const {
    updateComponentId,
    setUpdateComponentId,
    deletingId,
    setDeletingId,
    openDialog,
    setOpenDialog,
    handleFormSubmit,
    handleUpdateFeeComponent,
    handleDelete,
    isSubmitting,
    isDeleting
  } = useFeeComponentForm({
    feePolicyId: id,
    onSuccess: () => setOpen(false),
    setSelectedRow
  })

  // API Queries
  const { data: feeComponent } = useGetFeeComponentByIdQuery(
    selectedRow?.id ?? '',
    {
      skip: !selectedRow?.id
    }
  )

  const { data: feeComponentTierData } = useGetFeeComponentTierQuery(
    selectedRow?.id ?? '',
    {
      skip:
        !selectedRow?.id ||
        (selectedRow?.calculationMethod !== 'PROGRESSIVE_TIER' &&
          selectedRow?.calculationMethod !== 'FLAT_TIER')
    }
  )

  const { data: policyData } = useGetFeePolicyByIdQuery(id!, {
    skip: !isEdit
  })

  const { data: feeComponentPolicyData } = useGetFeeComponentPoliciesByIdQuery(
    id!,
    { skip: !isEdit }
  )

  const { data: feeData } = useGetFeeComponentPoliciesQuery(
    {
      page,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    },
    { skip: isEdit }
  )

  const [putFeePolicies, { isLoading: putFeePoliciesLoading }] =
    usePutFeePolicyMutation()

  const [postNewPolicy] = usePostNewPolicyMutation()

  const combinedInitialData = useMemo(() => {
    if (!feeComponent) return null
    if (feeComponentTierData && feeComponentTierData.length > 0) {
      const tiers = feeComponentTierData.map((item: feePolicyComponent) => ({
        id: item.id,
        minValue: item.minValue,
        maxValue: item.maxValue,
        roundMode: item.roundMode,
        minFee: item.minFee,
        maxFee: item.maxFee,
        fixedAmount: item.fixedAmount,
        percentage: item.percentage
      }))
      return { ...feeComponent, tiers }
    }
    return feeComponent
  }, [feeComponent, feeComponentTierData])

  const list = (feeComponentPolicyData ?? feeData?.content) || []
  const total = feeData?.totalElements || 0

  const sortedList = useMemo(() => {
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [list])

  const dataSource = useMemo(() => {
    return sortedList.map((item: feePolicyComponent, idx: number) => ({
      ...item,
      no: (page - 1) * pageSize + idx + 1
    }))
  }, [sortedList, page, pageSize])

  const columns = feeComponentColumns({
    setSelectedRow,
    setOpen,
    setUpdateComponentId,
    setDeletingId,
    setOpenDialog
  })

  const DEFAULT_VALUES = {
    name: '',
    description: '',
    priority: 0,
    status: '',
    validFrom: '',
    validTo: '',
    currency: '',
    serviceType: '',
    feeDomain: ''
  }

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<PolicyType>({
    resolver: zodResolver(PolicySchema),
    defaultValues:DEFAULT_VALUES
  })

  useEffect(() => {
    if (policyData) {
      reset(policyData)
    }
  }, [policyData, reset])

  const onSubmit = async (data: PolicyType) => {
    try {
      await postNewPolicy(data).unwrap()
      successMess('Thêm chính sách thành công!')
    } catch (error) {
      errorMess(error?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleUpdate = async (data: PolicyType) => {
    try {
      const payload = {
        ...data,
        validFrom: data.validFrom ? convertToISO(data.validFrom) : '',
        validTo: data.validTo ? convertToISO(data.validTo) : ''
      }
      await putFeePolicies({ id: id, body: payload })
      successMess('Cập nhật chính sách thành công!')
    } catch (error) {
      errorMess('Lỗi cập nhật!')
    }
  }

  const handleSaveAddFee = () => {
    if (selectedRow) {
      formRef.current?.update()
    } else {
      formRef.current?.submit()
    }
  }

  const handleOpenAddModal = () => {
    formRef.current?.reset()
    setSelectedRow(null)
    setUpdateComponentId(null)
    setOpen(true)
  }

  return (
    <div>
      <div>
        <ButtonComponent
          type='default'
          content='Quay lai'
          onClick={() => navigate(`${FEEMANAGEMENR_V3}/fee-management`)}
          icon={
            <svg
              width={20}
              height={20}
            >
              <use href='/icons.svg#hugeicons-arrow-left-02' />
            </svg>
          }
        />
      </div>

      <div className='flex flex-col justify-center item-center my-2 gap-2'>
        <div className='item1 bg-white rounded p-3'>
          <div className='header'>
            <div className='flex justify-between items-center'>
              <p className='text-lg font-semibold'>1. Thông tin chung</p>
              <div className='flex justify-end items-center'>
                <ButtonComponent
                  form='policyForm'
                  htmlType='submit'
                  content='Thiết lập'
                  icon={
                    <svg
                      width={20}
                      height={20}
                    >
                      <use href='/icons.svg#hugeicons-file-add' />
                    </svg>
                  }
                />
              </div>
            </div>
            <div className='content'>
              <FormAddPolicy
                control={control}
                handleSubmit={handleSubmit}
                id={id}
                handleUpdate={handleUpdate}
                onSubmit={onSubmit}
              />
            </div>
          </div>
        </div>

        <div className='item3 bg-white rounded p-3'>
          <div className='header flex justify-between items-center'>
            <p className='text-lg font-semibold'>
              2. Danh sách Cấu phần phí (Components)
            </p>
            <ButtonComponent
              htmlType='button'
              content='Thêm thành phần phí'
              onClick={handleOpenAddModal}
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
          <div className='content px-3'>
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
                }
              }}
            />
            <ModalComponent
              title={selectedRow ? 'Sửa thành phần phí' : 'Thêm thành phần phí'}
              open={open}
              onOk={handleSaveAddFee}
              onCancel={() => setOpen(false)}
              confirmLoading={isSubmitting}
              modalText={
                <FormAddFeeComponent
                  ref={formRef}
                  onSubmit={
                    selectedRow ? handleUpdateFeeComponent : handleFormSubmit
                  }
                  initialData={selectedRow ? combinedInitialData : null}
                />
              }
            />
          </div>
        </div>
      </div>

      <DialogModal
        open={openDialog}
        onOk={() => handleDelete(deletingId)}
        onCancel={() => setOpenDialog(false)}
        confirmLoading={isDeleting}
        content='Bạn có xác nhận xóa ?'
      />
    </div>
  )
}

export default FeeComponentManagement
