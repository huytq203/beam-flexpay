import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMessage } from '@hooks/useMessage'
import { useSVG } from '@hooks/useSVG'
import usePagination from '@hooks/usePagination'
import usePermissionCheck from '@hooks/usePermissionCheck'
import {
  useLazyGetAssignQuery,
  useLazyGetAssignSearchQuery,
  usePatchAssignActiveMutation,
  usePatchAssignInActiveMutation,
  usePostAssignMutation
} from '@services/apiFeeAssignment'
import { FeeAssignment } from '@pages/fee-management-v4/fee-assignment/constants/feeAssignment'
import { FeeAssignType } from '@pages/fee-management-v4/fee-assignment/schemas/feeAssign.schema'
import { getFeeAssignColumn } from '../columns/FeeAssignmentManagement.column'

const useHandleFeeAssignment = () => {
  const [getAllAssign, { data: dataFeeAssign, isLoading: loadingAll }] = useLazyGetAssignQuery()
  const [patchAssignActive] = usePatchAssignActiveMutation()
  const [patchAssignInActive] = usePatchAssignInActiveMutation()
  const [getAssignSearch, { data: searchData, isLoading: loadingSearch }] = useLazyGetAssignSearchQuery()
  const [postAssign, { isLoading: isPostAssign }] = usePostAssignMutation()

  const [openModalDelete, setOpenModalDelete] = useState(false)
  const [selectRowId, setSelectRowId] = useState('')
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalSelectPolicy, setOpenModalSelectPolicy] = useState(false)
  const [isCreate, setIsCreate] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchParams, setSearchParams] = useState<FeeAssignType | null>(null)

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

  const { page, pageSize, setPage, setPageSize } = usePagination()

  useEffect(() => {
    if (isSearching && searchParams) {
      getAssignSearch({
        ...searchParams,
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      }).unwrap().catch(() => { })
    } else if (!isSearching) {
      getAllAssign({
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      }).unwrap().catch(() => { })
    }
  }, [page, pageSize, isSearching, searchParams, getAssignSearch, getAllAssign])

  const handleSearch = useCallback(async (data: FeeAssignType) => {
    setPage(1)
    setSearchParams(data)
    setIsSearching(true)
    await getAssignSearch({
      ...data,
      page: 1,
      size: pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    }).unwrap().catch(() => { })
  }, [pageSize, getAssignSearch, setPage])

  const handleReset = useCallback(() => {
    reset()
    setSearchParams(null)
    setIsSearching(false)
    setPage(1)
    setPageSize(10)
    getAllAssign({
      page: 1,
      size: 10,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    })
  }, [reset, setPage, setPageSize, getAllAssign])

  const handleToggleStatus = useCallback(async (record: FeeAssignment) => {
    try {
      if (record.status === 'ACTIVE') {
        await patchAssignInActive(record.id).unwrap()
        successMess('Khóa thành công!')
      } else {
        await patchAssignActive(record.id).unwrap()
        successMess('Mở khóa thành công!')
      }
    } catch (error: any) {
      errorMess(error?.data?.detail || 'Có lỗi xảy ra')
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
    } catch (error: any) {
    }
  }, [postAssign, successMess, errorMess, reset])

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
    (isSearching ? searchData?.content : dataFeeAssign?.content) || []
    , [isSearching, searchData?.content, dataFeeAssign?.content])

  const total = useMemo(() =>
    (isSearching ? searchData?.totalElements : dataFeeAssign?.totalElements) || 0
    , [isSearching, searchData?.totalElements, dataFeeAssign?.totalElements])

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
    loadingAll,
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
    page,
    pageSize,
    total,
    handlePaginationChange,
    canCreate,
    svg
  }
}

export default useHandleFeeAssignment
