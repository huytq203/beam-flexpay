import { useNavigate } from 'react-router-dom'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'
import {
  ButtonComponent,
  Table,
  ModalComponent
} from '@components/common'
import { Card, message } from 'antd'
import React, { useState } from 'react'
import {
  useGetFeePoliciesQuery,
  useLazySearchFeePoliciesQuery,
  usePatchDeactivateFeeMutation,
  usePatchActivateFeeMutation,
  usePostNewPolicyMutation
} from '@services/apiFeePoliciesServices'
import { useForm } from 'react-hook-form'
import { FormInput, FormSelect } from '@components/form'
import FormAddPolicy from '@pages/fee-managerment-v3/components/FormAddPolicy'
import { PolicyType } from './FeeManagement.schema'
import { feeDomain, serviceType } from '@type/feePoliciesComponent'
import { getPolicyColumns } from './FeeManagement.columns'

const FeeManagement = () => {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [patchDeactivateFee] = usePatchDeactivateFeeMutation()
  const [patchActivateFee] = usePatchActivateFeeMutation()
  const { data } = useGetFeePoliciesQuery({
    page,
    size: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  })
  const [searchFeePolicies, { data: searchData }] =
    useLazySearchFeePoliciesQuery()
  const navigate = useNavigate()
  const [postNewPolicy, { isLoading: loadingNewPolicy }] = usePostNewPolicyMutation()
  const list = (searchData?.content ?? data?.content) || []
  const total = (searchData?.totalElements ?? data?.totalElements) || 0
  
  const dataSource = list.map((item, index) => ({
    key: item.id,
    no: (page - 1) * pageSize + index + 1,
    name: item.name,
    serviceType: item.serviceType,
    status: item.status,
    feeDomain: item.feeDomain,
    currency: item.currency,
    validFrom: item.validFrom,
    validTo: item.validTo
  }))

  const getSearchParams = () => ({
    keyword: '',
    serviceType: '',
    feeDomain: '',
    status: '',
    page,
    size: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  })

  const handleDeActiveFee = async (record: { key: string }) => {
    try {
      await patchDeactivateFee(record.key).unwrap()
      message.success('Cập nhật trạng thái thành công')
      searchFeePolicies(getSearchParams())
    } catch (error) {
      console.error(error)
      message.error('Cập nhật thất bại')
    }
  }

  const handleActiveFee = async (record: { key: string }) => {
    try {
      await patchActivateFee(record.key).unwrap()
      message.success('Cập nhật trạng thái thành công')
      searchFeePolicies(getSearchParams())
    } catch (error) {
      console.error(error)
      message.error('Cập nhật thất bại')
    }
  }

  const handleSaveAddFee = async (data: PolicyType) => {
    try {
      await postNewPolicy(data).unwrap()
      message.success('Add thành công')
      resetAdd()
      setOpen(false)
      searchFeePolicies(getSearchParams())
    } catch (error: any) {
      message.error(error?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const columns = getPolicyColumns({
    navigate,
    handleDeActiveFee,
    handleActiveFee
  })

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      keyword: '',
      serviceType: '',
      feeDomain: '',
      status: ''
    }
  })
  const {
    control: controlAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd
  } = useForm<PolicyType>()

  const handleSearch = (formValues: object) => {
    searchFeePolicies({
      ...formValues,
      page,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    })
  }

  return (
    <>
      <Card>
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
                  onClick={() => {
                    reset()
                    searchFeePolicies(getSearchParams())
                  }}
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
            <div className='flex justify-end flex-col'></div>
          </div>
        </form>

        <div className=''>
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
      </Card>
      <ModalComponent
        title='Thêm chính sách mới'
        open={open}
        onOk={handleSubmitAdd(handleSaveAddFee)}
        onCancel={() => setOpen(false)}
        width='50%'
        confirmLoading={loadingNewPolicy}
        modalText={
          <FormAddPolicy
            control={controlAdd}
            handleSubmit={handleSubmitAdd}
            onSubmit={handleSaveAddFee}
          />
        }
      />
    </>
  )
}

export default FeeManagement
