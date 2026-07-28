import { useState, useCallback, useMemo } from 'react'
import { useLazyGetPermissionByKeyQuery } from '@services/apiPermission'
import { ModalType, SelectedPermission } from '../types/RoleManagement.type'
import { getRoleManagementColumn } from '../columns/RoleManagement.column'
import useFetchDataPermission from './useFetchDataPermission'

type SearchFormData = {
  roleCode: string
  keyword: string
  status: string
}

const useHandlePermission = (fetchHook: ReturnType<typeof useFetchDataPermission>) => {
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedPermission, setSelectedPermission] = useState<SelectedPermission | null>(null)
  const [searchParams, setSearchParams] = useState<SearchFormData | null>(null)

  const [getPermissionByKey] = useLazyGetPermissionByKeyQuery()

  const openModal = useCallback((type: ModalType, permission?: SelectedPermission | null) => {
    setSelectedPermission(permission ?? null)
    setModalType(type)
  }, [])

  const closeModal = useCallback(() => {
    setModalType(null)
    setSelectedPermission(null)
    fetchHook.setIsSearchMode(false)
    fetchHook.setSearchData(null)
    fetchHook.refetch()
  }, [fetchHook])

  const handleSearch = useCallback(
    async (data: SearchFormData) => {
      const isEmpty = !data.roleCode && !data.keyword && !data.status
      if (isEmpty) {
        setSearchParams(null)
        fetchHook.setIsSearchMode(false)
        fetchHook.setSearchData(null)
        fetchHook.setPage(1)
        return
      }
      try {
        fetchHook.setPage(1)
        const queryParams = {
          page: 1,
          size: fetchHook.pageSize,
          sortBy: 'id',
          sortDirection: 'DESC',
          ...(data.roleCode && { roleCode: data.roleCode }),
          ...(data.keyword && { keyword: data.keyword }),
          ...(data.status && { status: data.status })
        }
        const result = await getPermissionByKey(queryParams).unwrap()
        setSearchParams(data)
        fetchHook.setSearchData(result)
        fetchHook.setIsSearchMode(true)
      } catch {
        // errorMess(getApiErrorDetail(error) || 'Lỗi tìm kiếm')
      }
    },
    [fetchHook, getPermissionByKey]
  )

  const handleRefresh = useCallback(async () => {
    if (searchParams) {
      await handleSearch(searchParams)
      return
    }
    await fetchHook.refetch()
  }, [fetchHook, handleSearch, searchParams])

  const column = useMemo(
    () => getRoleManagementColumn({ openModal }),
    [openModal]
  )

  return {
    modalType,
    selectedPermission,
    openModal,
    closeModal,
    handleSearch,
    handleRefresh,
    column
  }
}

export default useHandlePermission
