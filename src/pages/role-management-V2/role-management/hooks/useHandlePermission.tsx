import { useState, useCallback, useMemo } from 'react'
import { useLazyGetPermissionByKeyQuery } from '@services/apiPermission'
import { useMessage } from '@hooks/useMessage'
import { ModalType, SelectedPermission } from '../types/RoleManagement.type'
import { getRoleManagementColumn } from '../columns/RoleManagement.column'
import useFetchDataPermission from './useFetchDataPermission'

type SearchFormData = {
  roleCode: string
  keyword: string
  status: string
}

const useHandlePermission = (fetchHook: ReturnType<typeof useFetchDataPermission>) => {
  const { errorMess } = useMessage()

  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedPermission, setSelectedPermission] = useState<SelectedPermission | null>(null)

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
        fetchHook.setIsSearchMode(false)
        fetchHook.setSearchData(null)
        fetchHook.setPage(1)
        return
      }
      try {
        fetchHook.setPage(1)
        const searchParams = {
          page: 1,
          size: fetchHook.pageSize,
          sortBy: 'id',
          sortDirection: 'DESC',
          ...(data.roleCode && { roleCode: data.roleCode }),
          ...(data.keyword && { keyword: data.keyword }),
          ...(data.status && { status: data.status })
        }
        const result = await getPermissionByKey(searchParams).unwrap()
        fetchHook.setSearchData(result)
        fetchHook.setIsSearchMode(true)
      } catch (error: any) {
        // errorMess(error?.data?.detail || 'Lỗi tìm kiếm')
      }
    },
    [fetchHook, getPermissionByKey, errorMess]
  )

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
    column
  }
}

export default useHandlePermission
