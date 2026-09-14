import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMessage } from '@hooks/useMessage'
import { useSVG } from '@hooks/useSVG'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  useGetAssignSearchQuery,
  usePatchAssignActiveMutation,
  usePatchAssignInActiveMutation,
  usePostAssignMutation
} from '@services/apiFeeAssignment'
import { FeeAssignment } from '@pages/fee-management-v4/fee-assignment/constants/feeAssignment'
import { FeeAssignType } from '@pages/fee-management-v4/fee-assignment/schemas/feeAssign.schema'
import { useCustomerSegmentNames } from '@hooks/useCustomerSegmentNames'
import { getFeeAssignColumn } from '../columns/FeeAssignmentManagement.column'

/** Pulls `data.detail` out of an RTK Query error without assuming its shape. */
const getErrorDetail = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('data' in error)) return undefined
  const data = (error as { data: unknown }).data
  if (typeof data !== 'object' || data === null || !('detail' in data)) return undefined
  const detail = (data as { detail: unknown }).detail
  return typeof detail === 'string' ? detail : undefined
}

/** Đúng các tham số `/fee/policy-assignments/search` nhận — không thêm khoá ảo. */
const FILTER_KEYS = ['feePolicyId', 'merchantId', 'bankCode', 'status'] as const

const useHandleFeeAssignment = () => {
  const { filters, applyFilters, clearFilters, page, size, setPage, setPageSize } =
    useUrlFilters({ keys: FILTER_KEYS })

  const payload = useMemo(
    () => ({
      ...filters,
      sortDirection: 'DESC',
      sortBy: 'createdAt',
      size,
      page
    }),
    [filters, page, size]
  )

  const [patchAssignActive, { isLoading: isActivating }] = usePatchAssignActiveMutation()
  const [patchAssignInActive] = usePatchAssignInActiveMutation()
  const {
    data: searchData,
    isLoading: loadingSearch,
    isFetching,
    refetch
  } = useGetAssignSearchQuery(payload)
  const [postAssign, { isLoading: isPostAssign }] = usePostAssignMutation()
  const customerSegmentNames = useCustomerSegmentNames()

  // BE bắt buộc query param `reason` khi kích hoạt → hỏi lý do qua modal.
  const [activateId, setActivateId] = useState<string | null>(null)
  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectRowId, setSelectRowId] = useState('')
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalSelectPolicy, setOpenModalSelectPolicy] = useState(false)
  const [isCreate, setIsCreate] = useState(true)

  const { successMess, errorMess } = useMessage()
  const navigate = useNavigate()
  const { svg } = useSVG()

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch
  } = useForm<FeeAssignType>({
    shouldUnregister: true,
    // URL là nguồn sự thật của bộ lọc; form chỉ phản chiếu lại.
    values: {
      bankCode: filters.bankCode ?? '',
      status: filters.status ?? ''
    } as FeeAssignType,
    defaultValues: {
      account: '',
      applyDate: '',
      applyType: '',
      createDate: ''
    }
  })

  const handleSearch = useCallback(
    (data: FeeAssignType) => {
      applyFilters({
        bankCode: data.bankCode || null,
        status: data.status || null
      })
    },
    [applyFilters]
  )

  const handleReset = useCallback(() => {
    reset()
    clearFilters()
  }, [reset, clearFilters])

  const handleToggleStatus = useCallback(async (record: FeeAssignment) => {
    if (record.status !== 'ACTIVE') {
      setActivateId(record.id)
      return
    }

    try {
      await patchAssignInActive(record.id).unwrap()
      successMess('Khóa thành công!')
    } catch (error) {
      errorMess(getErrorDetail(error) || 'Có lỗi xảy ra')
    }
  }, [patchAssignInActive, successMess, errorMess])

  const handleConfirmActivate = useCallback(async (reason: string) => {
    if (!activateId) return

    try {
      await patchAssignActive({ id: activateId, reason }).unwrap()
      successMess('Mở khóa thành công!')
      setActivateId(null)
    } catch (error) {
      errorMess(getErrorDetail(error) || 'Có lỗi xảy ra')
    }
  }, [activateId, patchAssignActive, successMess, errorMess])

  const handleCancelActivate = useCallback(() => setActivateId(null), [])

  const handleDelete = useCallback(() => {
    alert('Delete ID:' + selectRowId)
    setOpenModalDelete(false)
  }, [selectRowId])

  const handlePostAssign = useCallback(async (data: FeeAssignType) => {
    try {
      const payload = {
        feePolicyId: data.feePolicyId,
        merchantId: data.merchantId,
        bankCode: data.bankCode,
        paymentMethod: data.paymentMethod,
        cardType: data.cardType,
        serviceType: data.serviceType,
        customerGroup: data.customerGroup || undefined,
        status: data.status
      }
      await postAssign(payload).unwrap()
      successMess('Thêm mới thành công!')
      setOpenModalAdd(false)
      reset()
    } catch {
    }
  }, [postAssign, successMess, reset])

  const handleSelectPolicy = useCallback((feePolicyId: string) => {
    setValue('feePolicyId', feePolicyId)
    setOpenModalSelectPolicy(false)
  }, [setValue])

  const columns = useMemo(() => getFeeAssignColumn({
    setOpenModalDelete,
    setSelectRowId,
    onToggleStatus: handleToggleStatus,
    navigate,
    customerSegmentNames
  }), [customerSegmentNames, handleToggleStatus, navigate])

  const listData: FeeAssignment[] = useMemo(() =>
    searchData?.content || []
  , [searchData?.content])

  const total = useMemo(() =>
    searchData?.totalElements || 0
  , [searchData?.totalElements])

  const dataSource = useMemo(() => listData.map((item, idx: number) => ({
    ...item,
    no: (page - 1) * size + idx + 1
  })), [listData, page, size])

  const handlePaginationChange = useCallback((newPage: number, newSize: number) => {
    // Đổi số dòng mỗi trang thì `useUrlFilters` tự đưa về trang 1.
    if (newSize !== size) {
      setPageSize(newSize)
      return
    }
    setPage(newPage)
  }, [size, setPage, setPageSize])

  const handleOpenModalAdd = useCallback(() => {
    setIsCreate(true)
    setOpenModalAdd(true)
  }, [])

  const handleCloseModalAdd = useCallback(() => {
    setOpenModalAdd(false)
  }, [])

  const handleCloseModalDelete = useCallback(() => {
    setOpenModalDelete(false)
  }, [])

  const handleCloseModalSelectPolicy = useCallback(() => {
    setOpenModalSelectPolicy(false)
  }, [])

  return {
    loadingSearch,
    isPostAssign,
    openModalDelete,
    openModalAdd,
    openModalSelectPolicy,
    isCreate,
    control,
    setValue,
    watch,
    handleSubmit,
    handleSearch,
    handleReset,
    handleOpenModalAdd,
    handleCloseModalAdd,
    handleDelete,
    handleCloseModalDelete,
    handlePostAssign,
    handleCloseModalSelectPolicy,
    handleSelectPolicy,
    columns,
    dataSource,
    isFetching,
    refetch,
    page,
    pageSize: size,
    total,
    handlePaginationChange,
    activateId,
    isActivating,
    handleConfirmActivate,
    handleCancelActivate,
    svg
  }
}

export default useHandleFeeAssignment
