import React, { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { feePolicyComponent } from '@type/feePoliciesComponent'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PolicySchema, PolicyType, FeeComponentType } from './FeeManagement.schema'
import {
  FormInput,
  FormTextArea,
  FormSelect,
  FormDatePicker
} from '@components/form'

import {
  DateInput,
  SelectInput,
  TextArea,
  Input,
  ModalComponent,
  ButtonComponent,
  Table,
  DialogModal
} from '@components/common'
import FormAddFee from '@pages/test/components/FormAddFee'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import {
  useDeleteFeeComponentPoliciesMutation,
  useGetFeeComponentPoliciesByIdQuery,
  useGetFeeComponentPoliciesQuery,
  usePostFeeComponentPoliciesMutation
} from '@services/apiFeeComponent'
import { useNavigate } from 'react-router-dom'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'
import {
  useGetFeePolicyByIdQuery,
  usePostNewPolicyMutation,
  usePutFeePolicyMutation
} from '@services/apiFeePoliciesServices'
import { message } from 'antd'
import { useParams } from 'react-router-dom'

const TestDemo = () => {
  // Mock API trigger cho CustomSelect
  const [open, setOpen] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)

  const [page, setPage] = useState(1)

  const [pageSize, setPageSize] = useState(10)

  const [selectedRow, setSelectedRow] = useState<any>(null)

  const [deleteFeeComponent, { isLoading, isSuccess, isError, error }] =
    useDeleteFeeComponentPoliciesMutation()

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
  const [postFeeComponent] = usePostFeeComponentPoliciesMutation()
  const { data: feeData, refetch } = useGetFeeComponentPoliciesQuery(
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
      message.success('add thành công')
      reset()
    } catch (error: any) {
      message.error(error?.data?.message)
    }
  }

  const convertToISO = (dateString: string) => {
    return new Date(dateString.replace(' ', 'T')).toISOString()
  }

  const handleUpdate = async (data: PolicyType) => {
    try {
      const payload = {
        ...data,
        validFrom: convertToISO(data.validFrom),
        validTo: convertToISO(data.validTo)
      }
      await putFeePolicies({ id: id, body: payload })
      message.success('update thành công')
    } catch (error) {}
  }

  const handleDelete = async (record: any) => {
    try {
      await deleteFeeComponent(record.id).unwrap()
      await refetch()
      setOpenDialog(false)
      message.success('Xoá thành công!')
    } catch (error) {
      message.error('Lỗi xoá!')
    }
  }

  const dataSource = list.map((item: feePolicyComponent, idx: number) => ({
    id: item.id,
    no: (page - 1) * pageSize + idx + 1,
    componentType: item.componentType,
    calculationMethod: item.calculationMethod,
    fixedAmount: item.fixedAmount,
    payerType: item.payerType
  }))

  const columns = [
    {
      title: 'STT',
      dataIndex: 'no',
      width: 60,
      align: 'center' as const,
      className: 'border border-b-0'
    },
    {
      title: 'Loại (Type)',
      dataIndex: 'componentType',
      key: 'componentType',
      className: ' border border-l-0'
    },
    {
      title: 'Cách tính',
      dataIndex: 'calculationMethod',
      key: 'calculationMethod',
      className: ' border border-l-0 border-b-0'
    },
    {
      title: 'Công thức',
      dataIndex: 'fixedAmount',
      key: 'fixedAmount',
      className: ' border border-l-0 border-b-0'
    },
    {
      title: 'Người trả',
      dataIndex: 'payerType',
      key: 'payerType',
      className: ' border border-l-0 border-b-0'
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 50,
      className: 'border border-l-0 border-b-0',
      align: 'center' as const,
      render: (record: any) => (
        <div className='flex gap-1 justify-center'>
          <ButtonComponent
            type='text'
            icon={<EditOutlined />}
            onClick={() => setOpen(true)}
          />
          <ButtonComponent
            type='text'
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedRow(record)
              setOpenDialog(true)
            }}
          />
        </div>
      )
    }
  ]

  const formRef = useRef<{ submit: () => void; reset: () => void }>(null)
  
  const handleFormSubmit = (data: FeeComponentType) => {
    // console.log('Submitted Data:', data)
    // formRef.current?.reset();
    // setOpen(false)
    alert(123)
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
              <form
                id='policyForm'
                onSubmit={handleSubmit(id ? handleUpdate : onSubmit)}
              >
                <div className='grid grid-cols-12 gap-2'>
                  <FormInput
                    name='name'
                    control={control}
                    label='Tên chính sách phí'
                    placeholder='Nhập tên chính sách...'
                  />
                  <FormSelect
                    name='priority'
                    control={control}
                    label='Mức độ ưu tiên'
                    defaultValue={0}
                    options={[
                      { label: 'Cao', value: 0 },
                      { label: 'Trung bình', value: 1 },
                      { label: 'Thấp', value: 2 }
                    ]}
                  />

                  <FormDatePicker
                    name='validFrom'
                    control={control}
                    label='Hiệu lực từ'
                  />
                  <FormDatePicker
                    name='validTo'
                    control={control}
                    label='Hiệu lực đến'
                  />

                  <FormSelect
                    name='status'
                    control={control}
                    label='Trạng thái hoạt động'
                    defaultValue=''
                    options={[
                      { label: 'Chọn', value: '' },
                      { label: 'INIT', value: 'INIT' },
                      { label: 'ACTIVE', value: 'ACTIVE' },
                      { label: 'INACTIVE', value: 'INACTIVE' },
                      { label: 'LOCKED', value: 'LOCKED' }
                    ]}
                  />

                  <FormSelect
                    name='serviceType'
                    control={control}
                    label='Loại dịch vụ'
                    defaultValue=''
                    options={[
                      { label: 'Chọn tất cả', value: '' },
                      {
                        label: 'EWALLET_WITHDRAWAL',
                        value: 'EWALLET_WITHDRAWAL'
                      },
                      {
                        label: 'EWALLET_TRANSFER_INTERNAL',
                        value: 'EWALLET_TRANSFER_INTERNAL'
                      },
                      {
                        label: 'EWALLET_TRANSFER_EXTERNAL',
                        value: 'EWALLET_TRANSFER_EXTERNAL'
                      },
                      { label: 'EWALLET_CASHBACK', value: 'EWALLET_CASHBACK' },
                      {
                        label: 'MERCHANT_VA_BILL_COLLECTION',
                        value: 'MERCHANT_VA_BILL_COLLECTION'
                      }
                    ]}
                  />
                  <FormInput
                    name='currency'
                    control={control}
                    label='Đơn vị thanh toán'
                    placeholder='Nhập đơn vị thanh toán...'
                  />

                  <FormSelect
                    name='feeDomain'
                    control={control}
                    label='Phí miền'
                    defaultValue=''
                    options={[
                      { label: 'Chọn tất cả', value: '' },
                      { label: 'BANK', value: 'BANK' },
                      { label: 'EWALLET', value: 'EWALLET' },
                      { label: 'MERCHANT', value: 'MERCHANT' }
                    ]}
                  />

                  <FormTextArea
                    name='description'
                    control={control}
                    label='Mô tả'
                    placeholder='Nhập mô tả chính sách...'
                  />
                </div>
              </form>
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
              open={open}
              onOk={handleSaveAddFee}
              onCancel={() => setOpen(false)}
              //   confirmLoading={confirmLoading}
              modalText={<FormAddFee ref={formRef} onSubmit={handleFormSubmit} />}
            />
          </div>
        </div>
      </div>
      <DialogModal
        open={openDialog}
        onOk={() => handleDelete(selectedRow)}
        onCancel={() => setOpenDialog(false)}
        confirmLoading={isLoading}
        content='Bạn có xác nhận xóa ?'
      />
    </div>
  )
}

export default TestDemo
