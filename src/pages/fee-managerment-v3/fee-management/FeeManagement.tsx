import { useNavigate } from 'react-router-dom'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'
import {
  ModalComponent,
  CardComponent
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

import FormAddPolicy from '@pages/fee-managerment-v3/components/FormAddPolicy'
import { PolicySchema, PolicyType } from '../FeeManagement.schema'

import { getPolicyColumns } from './FeeManagement.columns'
import { useMessage } from '@hooks/useMessage'
import FeeManagementForm from './FeeManagement.form'
import { zodResolver } from '@hookform/resolvers/zod'
import { feeSearch } from '@type/feePolicies'

const FeeManagement = () => {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [patchDeactivateFee] = usePatchDeactivateFeeMutation()
  const [patchActivateFee] = usePatchActivateFeeMutation()
  const { successMess, errorMess } = useMessage()
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
      successMess('Cập nhật trạng thái thành công')
      searchFeePolicies(getSearchParams())
    } catch (error) {
      console.error(error)
      errorMess('Cập nhật thất bại')
    }
  }

  const handleActiveFee = async (record: { key: string }) => {
    try {
      await patchActivateFee(record.key).unwrap()
      successMess('Cập nhật trạng thái thành công')
      searchFeePolicies(getSearchParams())
    } catch (error) {
      console.error(error)
      errorMess('Cập nhật thất bại')
    }
  }

  const handleSaveAddFee = async (data: PolicyType) => {
    try {
      await postNewPolicy(data).unwrap()
      successMess('Add thành công')
      resetAdd()
      setOpen(false)
      searchFeePolicies(getSearchParams())
    } catch (error: any) {
      errorMess(error?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const dataSource = list
    .filter((item) => item.id !== undefined)
    .map((item, index) => ({
      key: item.id!,
      no: (page - 1) * pageSize + index + 1,
      name: item.name,
      serviceType: item.serviceType,
      status: item.status,
      feeDomain: item.feeDomain,
      currency: item.currency,
      validFrom: item.validFrom,
      validTo: item.validTo
    }))

  const columns = getPolicyColumns({
    navigate,
    handleDeActiveFee,
    handleActiveFee
  })


  const { handleSubmit, reset, control } = useForm<feeSearch>({
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
    reset: resetAdd,
    formState: { errors },
  } = useForm<PolicyType>({
    resolver: zodResolver(PolicySchema),
    defaultValues: {
      name: "",
      validFrom: "",
      validTo: "",
      priority: 0,
      status: "",
      feeDomain: "",
      currency: "",
      serviceType: "",
      description: ""
    }
  });
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
      <CardComponent content={
        <FeeManagementForm
          control={control}
          handleSubmit={handleSubmit}
          handleSearch={handleSearch}
          reset={reset}
          onReset={() => {
            reset()
            searchFeePolicies(getSearchParams())
          }}
          setOpen={setOpen}
          dataSource={dataSource}
          columns={columns}
          page={page}
          pageSize={pageSize}
          total={total}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      } />


      <ModalComponent
        title='Thêm chính sách mới'
        open={open}
        onOk={handleSubmitAdd(handleSaveAddFee)}
        onCancel={() => setOpen(false)}
        width='50%'
        confirmLoading={loadingNewPolicy}
        modalText={
          <CardComponent
            content={<FormAddPolicy
              control={controlAdd}
              handleSubmit={handleSubmitAdd}
              onSubmit={handleSaveAddFee}
            />
            }
          />

        }
      />
    </>
  )
}

export default FeeManagement
