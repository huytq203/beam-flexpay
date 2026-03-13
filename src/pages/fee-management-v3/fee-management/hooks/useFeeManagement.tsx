import { zodResolver } from '@hookform/resolvers/zod'
import {
  PolicySchema,
  PolicyType
} from '@pages/fee-management-v3/schemas/FeeManagement.schema'
import { feeSearch } from '@pages/fee-management-v3/constants/feePolicies'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getPolicyColumns } from '../columns/FeeManagement.columns'
import { useMessage } from '@hooks/useMessage'
import {
  useLazyGetFeePoliciesQuery,
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
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchParams, setSearchParams] = useState<feeSearch | null>(null)

  const [patchDeactivateFee] = usePatchDeactivateFeeMutation()
  const [patchActivateFee] = usePatchActivateFeeMutation()
  const { successMess, errorMess } = useMessage()

  // Lazy queries - control khi nào call
  const [getAllPolicies, { data: allData, isLoading: loadingAll }] = useLazyGetFeePoliciesQuery()
  const [searchFeePolicies, { data: searchData, isLoading: loadingSearch }] = useLazySearchFeePoliciesQuery()

  const navigate = useNavigate()
  const [postNewPolicy, { isLoading: loadingNewPolicy }] = usePostNewPolicyMutation()

  // Lấy data theo mode
  const list = (isSearchMode ? searchData?.content : allData?.content) || []
  const total = (isSearchMode ? searchData?.totalElements : allData?.totalElements) || 0

  // Fetch data khi page/pageSize thay đổi
  useEffect(() => {
    if (isSearchMode && searchParams) {
      // Đang ở chế độ search -> call search API
      searchFeePolicies({
        ...searchParams,
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      })
    } else if (!isSearchMode) {
      // Chế độ get all -> call getAll API (chỉ khi không phải search mode)
      getAllPolicies({
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      })
    }
  }, [page, pageSize, isSearchMode, JSON.stringify(searchParams)])

  const getSearchParams = () => ({
    ...searchParams,
    page,
    size: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  })

  const handleDeActiveFee = async (record: { key: string }) => {
    try {
      await patchDeactivateFee(record.key).unwrap()
      successMess('Cập nhật trạng thái thành công')
      // searchFeePolicies(getSearchParams())
    } catch {
    }
  }

  const handleActiveFee = async (record: { key: string }) => {
    try {
      await patchActivateFee(record.key).unwrap()
      successMess('Cập nhật trạng thái thành công')
      // searchFeePolicies(getSearchParams())
    } catch {
    }
  }

  const handleSaveAddFee = async (data: PolicyType): Promise<string | undefined> => {
    try {
      const result = await postNewPolicy(data).unwrap()
      successMess('Thêm mới thành công')
      return result?.data?.id
    } catch {
      return undefined
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
    formState: { errors }
  } = useForm<PolicyType>({
    resolver: zodResolver(PolicySchema),
    shouldUnregister: true,
    defaultValues: {
      name: '',
      validFrom: '',
      validTo: undefined,
      priority: undefined,
      status: undefined,
      feeDomain: undefined,
      currency: '',
      serviceType: undefined,
      description: undefined
    }
  })

  // Tìm kiếm - chuyển sang search mode
  const handleSearch = (formValues: feeSearch) => {
    setPage(1) // Reset về trang 1
    setSearchParams(formValues) // Lưu params để pagination dùng
    setIsSearchMode(true) // Chuyển sang search mode
    // Gọi API search ngay lập tức
    searchFeePolicies({
      ...formValues,
      page: 1,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    })
  }

  // Xóa bộ lọc - quay về get all mode và gọi API ngay
  const handleReset = () => {
    setSearchParams(null)
    setIsSearchMode(false)
    setPage(1)
    reset() // Reset form input
    // Gọi API get all ngay lập tức
    getAllPolicies({
      page: 1,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    })
  }

  return {
    control,
    handleSubmit,
    handleSearch,
    handleReset,
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
    resetAdd,
    isCreate,
    isSearchMode,

    loadingSearch,
    loadingAll
  }
}

export default useFeeManagement
