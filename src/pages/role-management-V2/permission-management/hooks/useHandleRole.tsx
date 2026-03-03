import { useState, useCallback, useMemo } from 'react'
import { useAppSelector } from '@hooks/hook'
import { useLazyGetRoleByKeyQuery } from '@services/apiRole'
import { useMessage } from '@hooks/useMessage'
import { ModalType, SelectedRole } from '../types/PermissionManagement.type'
import { PermissionManagementColumn } from '../columns/PermissionManagement.column'
import useFetchDataRole from './useFetchDataRole'
import { SearchFormData } from '../components/FormSearch'

const useHandleRole = (fetchHook: ReturnType<typeof useFetchDataRole>) => {
  const { profile } = useAppSelector((state) => state.auth)
  const currentUserRoles: string[] = profile?.roles ?? []
  const { errorMess } = useMessage()

  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null)

  const [searchRole] = useLazyGetRoleByKeyQuery()

  const openModal = useCallback((type: ModalType, role: SelectedRole | null) => {
    setSelectedRole(role)
    setModalType(type)
  }, [])

  const closeModal = useCallback(() => {
    setModalType(null)
    setSelectedRole(null)
    fetchHook.refetch()
  }, [fetchHook])

  const handleSearch = useCallback(
    async (data: SearchFormData) => {
      if (!data.keyword) {
        fetchHook.setIsSearchMode(false)
        fetchHook.setSearchData(null)
        fetchHook.setPage(1)
        return
      }
      try {
        const searchParams = {
          page: 1,
          size: fetchHook.pageSize,
          sortBy: 'id',
          sortDirection: 'DESC',
          ...(data.keyword && { keyword: data.keyword }),
          ...(data.status && { keyword: data.status })
        }
        const result = await searchRole(searchParams).unwrap()
        fetchHook.setSearchData(result)
        fetchHook.setIsSearchMode(true)
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [fetchHook, searchRole, errorMess]
  )

  const column = useMemo(
    () => PermissionManagementColumn({ openModal, currentUserRoles }),
    [openModal, currentUserRoles]
  )

  return {
    modalType,
    selectedRole,
    openModal,
    closeModal,
    handleSearch,
    column,
    currentUserRoles
  }
}

export default useHandleRole
