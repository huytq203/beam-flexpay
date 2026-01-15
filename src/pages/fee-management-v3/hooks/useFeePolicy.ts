// ============================================
// useFeePolicy - Fee Policy CRUD Operations Hook
// ============================================

import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMessage } from '@hooks/useMessage'
import {
  useGetFeePoliciesQuery,
  useLazySearchFeePoliciesQuery,
  usePatchDeactivateFeeMutation,
  usePatchActivateFeeMutation,
  usePostNewPolicyMutation
} from '@services/apiFeePoliciesServices'
import { FEEMANAGEMENT_V3 } from '@constants/routersConstant'
import { PolicySchema, type PolicyFormValues, type PolicySearchValues } from '../schemas'
import { transformPolicyToTableData, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from '../utils'
import type { PolicySearchParams, PolicyTableRecord, PaginationState } from '../types'

// ============================================
// Default Values
// ============================================
const DEFAULT_FORM_VALUES: PolicyFormValues = {
  name: '',
  validFrom: '',
  validTo: undefined,
  priority: undefined as unknown as number,
  status: undefined as unknown as string,
  feeDomain: undefined as unknown as string,
  currency: '',
  serviceType: undefined as unknown as string,
  description: undefined
}

const DEFAULT_SEARCH_VALUES: PolicySearchValues = {
  keyword: '',
  serviceType: undefined,
  feeDomain: undefined,
  status: undefined
}

// ============================================
// Hook Interface
// ============================================
interface UsePolicyResult {
  // Data
  dataSource: PolicyTableRecord[]
  total: number

  // Pagination
  pagination: PaginationState
  setPage: (page: number) => void
  setPageSize: (size: number) => void

  // Modal state
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void

  // Form controls (search form)
  searchControl: ReturnType<typeof useForm<PolicySearchValues>>['control']
  handleSearchSubmit: ReturnType<typeof useForm<PolicySearchValues>>['handleSubmit']
  resetSearch: () => void

  // Form controls (add policy form)
  addPolicyControl: ReturnType<typeof useForm<PolicyFormValues>>['control']
  handleAddSubmit: ReturnType<typeof useForm<PolicyFormValues>>['handleSubmit']
  addPolicyErrors: ReturnType<typeof useForm<PolicyFormValues>>['formState']['errors']

  // Actions
  handleSearch: (values: PolicySearchValues) => void
  handleSavePolicy: (data: PolicyFormValues) => Promise<void>
  handleActivate: (record: PolicyTableRecord) => Promise<void>
  handleDeactivate: (record: PolicyTableRecord) => Promise<void>
  navigateToEdit: (id: string) => void

  // Loading states
  isCreating: boolean
}

// ============================================
// Hook Implementation
// ============================================
export const useFeePolicy = (): UsePolicyResult => {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  // Hooks
  const navigate = useNavigate()
  const { successMess, errorMess } = useMessage()

  // API Queries
  const { data: policiesData } = useGetFeePoliciesQuery({
    page: pagination.page,
    size: pagination.pageSize,
    ...DEFAULT_SORT
  })

  const [searchPolicies, { data: searchData }] = useLazySearchFeePoliciesQuery()

  // API Mutations
  const [postNewPolicy, { isLoading: isCreating }] = usePostNewPolicyMutation()
  const [patchDeactivate] = usePatchDeactivateFeeMutation()
  const [patchActivate] = usePatchActivateFeeMutation()

  // Search Form
  const {
    control: searchControl,
    handleSubmit: handleSearchSubmit,
    reset: resetSearchForm
  } = useForm<PolicySearchValues>({
    defaultValues: DEFAULT_SEARCH_VALUES
  })

  // Add Policy Form
  const {
    control: addPolicyControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addPolicyErrors }
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(PolicySchema),
    shouldUnregister: true,
    defaultValues: DEFAULT_FORM_VALUES
  })

  // Derived data
  const activeData = searchData ?? policiesData
  const list = activeData?.content ?? []
  const total = activeData?.totalElements ?? 0

  const dataSource = useMemo(
    () => transformPolicyToTableData(list, pagination.page, pagination.pageSize),
    [list, pagination.page, pagination.pageSize]
  )

  // Build search params
  const buildSearchParams = useCallback(
    (values?: Partial<PolicySearchValues>): PolicySearchParams => ({
      keyword: values?.keyword ?? '',
      serviceType: values?.serviceType ?? '',
      feeDomain: values?.feeDomain ?? '',
      status: values?.status ?? '',
      page: pagination.page,
      size: pagination.pageSize,
      ...DEFAULT_SORT
    }),
    [pagination.page, pagination.pageSize]
  )

  // Action handlers
  const handleSearch = useCallback(
    (values: PolicySearchValues) => {
      searchPolicies(buildSearchParams(values))
    },
    [searchPolicies, buildSearchParams]
  )

  const resetSearch = useCallback(() => {
    resetSearchForm()
    searchPolicies(buildSearchParams())
  }, [resetSearchForm, searchPolicies, buildSearchParams])

  const handleSavePolicy = useCallback(
    async (data: PolicyFormValues) => {
      try {
        await postNewPolicy(data).unwrap()
        successMess('Thêm chính sách thành công')
        resetAddForm()
        setIsModalOpen(false)
        searchPolicies(buildSearchParams())
      } catch (error: unknown) {
        const err = error as { data?: { message?: string } }
        errorMess(err?.data?.message || 'Có lỗi xảy ra')
      }
    },
    [postNewPolicy, successMess, errorMess, resetAddForm, searchPolicies, buildSearchParams]
  )

  const handleActivate = useCallback(
    async (record: PolicyTableRecord) => {
      try {
        await patchActivate(record.key).unwrap()
        successMess('Kích hoạt thành công')
        searchPolicies(buildSearchParams())
      } catch (error) {
        console.error(error)
        errorMess('Cập nhật thất bại')
      }
    },
    [patchActivate, successMess, errorMess, searchPolicies, buildSearchParams]
  )

  const handleDeactivate = useCallback(
    async (record: PolicyTableRecord) => {
      try {
        await patchDeactivate(record.key).unwrap()
        successMess('Vô hiệu hóa thành công')
        searchPolicies(buildSearchParams())
      } catch (error) {
        console.error(error)
        errorMess('Cập nhật thất bại')
      }
    },
    [patchDeactivate, successMess, errorMess, searchPolicies, buildSearchParams]
  )

  const navigateToEdit = useCallback(
    (id: string) => {
      navigate(`${FEEMANAGEMENT_V3}/edit/${id}`)
    },
    [navigate]
  )

  // Pagination handlers
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
  }, [])

  // Modal handlers
  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    resetAddForm()
  }, [resetAddForm])

  return {
    // Data
    dataSource,
    total,

    // Pagination
    pagination: { ...pagination, total },
    setPage,
    setPageSize,

    // Modal
    isModalOpen,
    openModal,
    closeModal,

    // Search form
    searchControl,
    handleSearchSubmit,
    resetSearch,

    // Add policy form
    addPolicyControl,
    handleAddSubmit,
    addPolicyErrors,

    // Actions
    handleSearch,
    handleSavePolicy,
    handleActivate,
    handleDeactivate,
    navigateToEdit,

    // Loading
    isCreating
  }
}

export default useFeePolicy
