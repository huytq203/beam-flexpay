import { zodResolver } from '@hookform/resolvers/zod'
import { PolicySchema, PolicyType } from '@pages/fee-managerment-v3/schemas/FeeManagement.schema'
import { feeSearch } from '@type/feePolicies'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getPolicyColumns } from '../FeeManagement.columns'
import { useMessage } from '@hooks/useMessage'
import {
  useGetFeePoliciesQuery,
  useLazySearchFeePoliciesQuery,
  usePatchActivateFeeMutation,      
  usePatchDeactivateFeeMutation,
  usePostNewPolicyMutation
} from '@services/apiFeePoliciesServices'

const useFeeManagement = () => {
   const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isCreate, setIsCreate] = useState(false)



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
      serviceType: undefined,
      feeDomain: undefined,
      status: undefined
    }
  })

  const {
    control: controlAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors },
  } = useForm<PolicyType>({
    resolver: zodResolver(PolicySchema),
    shouldUnregister: true,
    defaultValues: {
    name: "",
  validFrom: "",
  validTo: undefined,
  priority: undefined,
  status: undefined,
  feeDomain: undefined,
  currency: "",
  serviceType: undefined,
  description: undefined
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

  return {
    control,
    handleSubmit,
    handleSearch,
    reset,
    setOpen,
    dataSource,
    columns,
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
    setIsCreate,
    open,
    handleSubmitAdd,
    handleSaveAddFee,
    loadingNewPolicy,
    controlAdd,
    isCreate,
    searchFeePolicies,
    getSearchParams
  }
}

export default useFeeManagement