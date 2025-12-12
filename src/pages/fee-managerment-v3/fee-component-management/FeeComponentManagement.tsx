import React, { useState, useEffect, useRef } from 'react'
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
  Table,
} from '@components/common'
import FormAddFeeComponent from '@pages/fee-managerment-v3/components/FormAddFeeComponent'
import {
  useDeleteFeeComponentPoliciesMutation,
  useGetFeeComponentByIdQuery,
  useGetFeeComponentPoliciesByIdQuery,
  useGetFeeComponentPoliciesQuery,
  usePostFeeComponentPoliciesMutation,
  usePutFeeComponentPoliciesMutation
} from '@services/apiFeeComponent'
import { useNavigate } from 'react-router-dom'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'
import {
  useGetFeePolicyByIdQuery,
  usePostNewPolicyMutation,
  usePutFeePolicyMutation
} from '@services/apiFeePoliciesServices'
import { useParams } from 'react-router-dom'
import FormAddPolicy from '../components/FormAddPolicy'
import { useGetFeeComponentTierQuery } from '@services/apiFeeComponentTier'
import { useMessage } from '@hooks/useMessage'
import { convertToISO } from './FeeComponentManagement.utils'

const FeeComponentManagerment = () => {
const {successMess, errorMess ,infoMess,warningMess} = useMessage()

  const [open, setOpen] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)

  const [page, setPage] = useState(1)

  const [pageSize, setPageSize] = useState(10)

  const [selectedRow, setSelectedRow] = useState<any>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [updateComponentId, setUpdateComponentId] = useState<string | null>(
    null
  )

  const { data: feeComponent } = useGetFeeComponentByIdQuery(selectedRow?.id, {
    skip: !selectedRow?.id
  })

  const { data: feeComponentTierData } = useGetFeeComponentTierQuery(
    selectedRow?.id,
    {
      skip:
        !selectedRow?.id ||
        (selectedRow?.calculationMethod !== 'PROGRESSIVE_TIER' &&
          selectedRow?.calculationMethod !== 'FLAT_TIER')
    }
  )

  const combinedInitialData = React.useMemo(() => {
    if (!feeComponent) return null
    if (feeComponentTierData && feeComponentTierData.length > 0) {
      const tiers = feeComponentTierData.map((item: any) => ({
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

  const [
    putFeeComponentPolicies,
    { isLoading: putFeeComponentPoliciesLoading }
  ] = usePutFeeComponentPoliciesMutation()

  const [
    deleteFeeComponent,
    { isLoading: deleteFeeComponentLoading, isSuccess, isError, error }
  ] = useDeleteFeeComponentPoliciesMutation()

  const { id } = useParams()

  const isEdit = Boolean(id)

  const { data: policyData } = useGetFeePolicyByIdQuery(id!, {
    skip: !isEdit
  })
  const { data: feeComponenPolicyData } = useGetFeeComponentPoliciesByIdQuery(
    id!,
    {
      skip: !isEdit
    }
  )

  const [putFeePolicies, { isLoading: putFeePoliciesLoading }] =
    usePutFeePolicyMutation()

  const [postFeeComponent, { isLoading: loadPostComponent }] =
    usePostFeeComponentPoliciesMutation()

  const { data: feeData } = useGetFeeComponentPoliciesQuery(
    {
      page,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    },
    { skip: isEdit }
  )

  const list = (feeComponenPolicyData ?? feeData?.content) || []

  const total = feeData?.totalElements || 0

  const navigate = useNavigate()

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<PolicyType>({
    resolver: zodResolver(PolicySchema),
    defaultValues: {
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
  })

  useEffect(() => {
    if (policyData) {
      reset(policyData)
    }
  }, [policyData, reset])

  const [postNewPolicy] = usePostNewPolicyMutation()

  const onSubmit = async (data: PolicyType) => {
    try {
      const res = await postNewPolicy(data).unwrap()
      successMess('Thêm chính sách thành công!')
    } catch (error: any) {
      errorMess(error?.data?.message)
    }
  }

 

  const handleUpdateFeeComponent = async (data: FeeComponentType) => {
    try {
      const payload = {
        componentType: data.componentType,
        baseOn: data.baseOn,
        baseComponentType: null,
        calculationMethod: data.calculationMethod,
        fixedAmount: data.fixedAmount ?? 0,
        percentage: data.percentage ?? 0,
        roundMode: data.roundMode,
        minFee: data.minFee ?? 0,
        maxFee: data.maxFee ?? 0,
        payerType: data.payerType,
        payerObjectType: null,
        payerObjectId: null,
        beneficiaryType: data.beneficiaryType,
        beneficiaryObjectType: null,
        beneficiaryObjectId: null
      }
      await putFeeComponentPolicies({
        id: updateComponentId,
        body: payload
      }).unwrap()
      successMess('Cập nhật thành phần phí thành công!')
      setOpen(false)
    } catch (error: any) {
      errorMess(error?.data?.message)
    }
  }

  const handleUpdate = async (data: PolicyType) => {
    try {
      const payload = {
        ...data,
        validFrom: convertToISO(data.validFrom),
        validTo: convertToISO(data.validTo)
      }
      await putFeePolicies({ id: id, body: payload })
      successMess('Cập nhật chính sách thành công!')
    } catch (error) {
      errorMess('Lỗi cập nhật!')
     }
  }

  const handleDelete = async (id: any) => {
    try {
      if (selectedRow?.id === id) setSelectedRow(null)
      await deleteFeeComponent(id).unwrap()
      setOpenDialog(false)
      successMess('Xoá thành công!')
    } catch (error) {
      errorMess('Lỗi xoá!')
    }
  }

  const sortedList = [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const dataSource = sortedList.map((item: feePolicyComponent, idx: number) => ({
    ...item,
    no: (page - 1) * pageSize + idx + 1
  }))

  const columns = feeComponentColumns({
      setSelectedRow,
      setOpen,
      setUpdateComponentId,
      setDeletingId,
      setOpenDialog
  })

  const formRef = useRef<{ submit: () => void; reset: () => void }>(null)

  const handleFormSubmit = async (data: FeeComponentType) => {
    try {
      const payload = {
        feePolicyId: id,
        componentType: data.componentType,
        baseOn: data.baseOn,
        baseComponentType: null,
        calculationMethod: data.calculationMethod,
        fixedAmount: data.fixedAmount ?? 0,
        percentage: data.percentage ?? 0,
        roundMode: data.roundMode,
        minFee: data.minFee ?? 0,
        maxFee: data.maxFee ?? 0,
        payerType: data.payerType,
        payerObjectType: null,
        payerObjectId: null,
        beneficiaryType: data.beneficiaryType,
        beneficiaryObjectType: null,
        beneficiaryObjectId: null
      }
      await postFeeComponent(payload).unwrap()
      successMess('Thêm thành phần phí thành công')
      setOpen(false)
    } catch (error: any) {
      errorMess(error?.data?.message)
    }
  }

  const handleSaveAddFee = () => {
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  return (
    <div>
      <div className=''>
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
      <div className='flex flex-col justify-center item-center   my-2 gap-2'>
        <div className='item1 bg-white rounded p-3 '>
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
        <div className='item3 bg-white rounded p-3 '>
          <div className='header flex justify-between items-center'>
            <p className='text-lg font-semibold'>
              2. Danh sách Cấu phần phí (Components)
            </p>
            <ButtonComponent
              htmlType='button'
              content='Thêm thành phần phí'
              onClick={() => {
                formRef.current?.reset()
                setSelectedRow(null)
                setUpdateComponentId(null)
                setOpen(true)
              }}
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
                onChange: (page, pageSize) => {
                  setPage(page)
                  setPageSize(pageSize)
                }
              }}
            />
            <ModalComponent
              title={selectedRow ? 'Sửa thành phần phí' : 'Thêm thành phần phí'}
              open={open}
              onOk={handleSaveAddFee}
              onCancel={() => setOpen(false)}
              confirmLoading={
                loadPostComponent || putFeeComponentPoliciesLoading
              }
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
        confirmLoading={deleteFeeComponentLoading}
        content='Bạn có xác nhận xóa ?'
      />
    </div>
  )
}

export default FeeComponentManagerment
