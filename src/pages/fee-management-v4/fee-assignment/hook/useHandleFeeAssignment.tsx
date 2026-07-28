import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMessage } from '@hooks/useMessage'
import { useSVG } from '@hooks/useSVG'
import usePagination from '@hooks/usePagination'
import usePermissionCheck from '@hooks/usePermissionCheck'
import {
  useGetAssignSearchQuery,
  usePatchAssignActiveMutation,
  usePatchAssignInActiveMutation,
  usePostAssignMutation
} from '@services/apiFeeAssignment'
import { FeeAssignment } from '@pages/fee-management-v4/fee-assignment/constants/feeAssignment'
import { FeeAssignType } from '@pages/fee-management-v4/fee-assignment/schemas/feeAssign.schema'
import { getFeeAssignColumn } from '../columns/FeeAssignmentManagement.column'

/** Pulls `data.detail` out of an RTK Query error without assuming its shape. */
const getErrorDetail = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('data' in error)) return undefined
  const data = (error as { data: unknown }).data
  if (typeof data !== 'object' || data === null || !('detail' in data)) return undefined
  const detail = (data as { detail: unknown }).detail
  return typeof detail === 'string' ? detail : undefined
}

const useHandleFeeAssignment = () => {
  const [filter, setFilter] = useState({})

  const { sortBy, sort, size, page, pageSize, setPage, setPageSize } = usePagination()
  const payload = {
    ...filter,
    sortDirection: sortBy,
    sortBy: sort,
    size,
    page
  }

  const [patchAssignActive] = usePatchAssignActiveMutation()
  const [patchAssignInActive] = usePatchAssignInActiveMutation()
  const {
    data: searchData,
    isLoading: loadingSearch,
    isFetching,
    refetch
  } = useGetAssignSearchQuery(payload)
  const [postAssign, { isLoading: isPostAssign }] = usePostAssignMutation()

  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectRowId, setSelectRowId] = useState('')
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalSelectPolicy, setOpenModalSelectPolicy] = useState(false)
  const [isCreate, setIsCreate] = useState(true)

  const { successMess, errorMess } = useMessage()
  const navigate = useNavigate()
  const { svg } = useSVG()
  const { hasAnyPermission } = usePermissionCheck()

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch
  } = useForm<FeeAssignType>({
    shouldUnregister: true,
    defaultValues: {
      account: '',
      applyDate: '',
      applyType: '',
      createDate: ''
    }
  })

  const canCreate = hasAnyPermission(['FEE:CREATE', 'FEE:FULL', 'ADMIN:FULL'])
  const canUpdate = hasAnyPermission(['FEE:UPDATE', 'FEE:FULL', 'ADMIN:FULL'])

  const handleSearch = useCallback(async (data: FeeAssignType) => {
    setPage(1)
    setFilter(data)
  }, [setPage])

  const handleReset = useCallback(() => {
    reset()
    setFilter({})
    setPage(1)
    setPageSize(10)
  }, [reset, setPage, setPageSize])

  const handleToggleStatus = useCallback(async (record: FeeAssignment) => {
    try {
      if (record.status === 'ACTIVE') {
        await patchAssignInActive(record.id).unwrap()
        successMess('Khóa thành công!')
      } else {
        await patchAssignActive(record.id).unwrap()
        successMess('Mở khóa thành công!')
      }
    } catch (error) {
      errorMess(getErrorDetail(error) || 'Có lỗi xảy ra')
    }
  }, [patchAssignInActive, patchAssignActive, successMess, errorMess])

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
        customerGroup: data.customerGroup || '',
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
    canUpdate
  }), [handleToggleStatus, navigate, canUpdate])

  const listData: FeeAssignment[] = useMemo(() =>
    searchData?.content || []
  , [searchData?.content])

  const total = useMemo(() =>
    searchData?.totalElements || 0
  , [searchData?.totalElements])

  const dataSource = useMemo(() => listData.map((item, idx: number) => ({
    ...item,
    no: (page - 1) * pageSize + idx + 1
  })), [listData, page, pageSize])

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }, [setPage, setPageSize])

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
    pageSize,
    total,
    handlePaginationChange,
    canCreate,
    svg
  }
}

export default useHandleFeeAssignment
