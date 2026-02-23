import { useCallback } from 'react'
import {
  useDeletePermissionMutation,
  useLazyGetPermissionByKeyQuery,
  usePostPermissionMutation,
  usePutPermissionMutation
} from '@services/apiPermission'
import { PermissionItem } from '@type/permissionManagement'
import { useMessage } from '@hooks/useMessage'
import { SearchFormData } from '../components/FormSearch'
import { RoleDataItem } from '@type/roleManagementV2'

interface UseRoleManagementActionsParams {
  selectedPermission: RoleDataItem | undefined
  setOpenModalAdd: (value: boolean) => void
  setOpenDialog: (value: boolean) => void
  setIsSearchMode: (value: boolean) => void
  setSearchData: (value: any) => void
  setPage: (value: number) => void
  pageSize: number
  refetch: () => void
}

export const useRoleManagementActions = ({
  selectedPermission,
  setOpenModalAdd,
  setOpenDialog,
  setIsSearchMode,
  setSearchData,
  setPage,
  pageSize,
  refetch
}: UseRoleManagementActionsParams) => {
  const { errorMess, successMess } = useMessage()

  const [getPermissionByKey, { isLoading: loadSearchRole }] = useLazyGetPermissionByKeyQuery()
  const [postPermission] = usePostPermissionMutation()
  const [putPermission] = usePutPermissionMutation()
  const [deletePermission] = useDeletePermissionMutation()

  const handleSearch = useCallback(
    async (data: SearchFormData) => {
      const isEmpty = !data.roleCode && !data.keyword && !data.status
      if (isEmpty) {
        setIsSearchMode(false)
        setSearchData(null)
        setPage(1)
        return
      }
      try {
        setPage(1)
        const searchParams = {
          page: 1,
          size: pageSize,
          sortBy: 'id',
          sortDirection: 'DESC',
          ...(data.roleCode && { roleCode: data.roleCode }),
          ...(data.keyword && { keyword: data.keyword }),
          ...(data.status && { status: data.status })
        }
        const result = await getPermissionByKey(searchParams).unwrap()
        setSearchData(result)
        setIsSearchMode(true)
      } catch (error: any) {
        errorMess(error?.data?.detail || 'Lỗi tìm kiếm')
      }
    },
    [pageSize, getPermissionByKey, setIsSearchMode, setSearchData, setPage, errorMess]
  )

  const handlePostPermission = useCallback(
    async (data: PermissionItem | Omit<PermissionItem, 'id'>) => {
      try {
        await postPermission(data).unwrap()
        setOpenModalAdd(false)
        successMess('Thêm thành công')
        setIsSearchMode(false)
        setSearchData(null)
        refetch()
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [postPermission, setOpenModalAdd, setIsSearchMode, setSearchData, refetch, successMess, errorMess]
  )

  const handlePutPermission = useCallback(
    async (data: PermissionItem | Omit<PermissionItem, 'id'>) => {
      try {
        await putPermission({
          permissionName: selectedPermission?.name,
          body: data
        }).unwrap()
        setOpenModalAdd(false)
        successMess('Sửa thành công')
        setIsSearchMode(false)
        setSearchData(null)
        refetch()
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [putPermission, selectedPermission?.name, setOpenModalAdd, setIsSearchMode, setSearchData, refetch, successMess, errorMess]
  )

  const handleDeletePermission = useCallback(
    async () => {
      try {
        await deletePermission(selectedPermission?.name).unwrap()
        setOpenDialog(false)
        refetch()
        successMess('Xóa thành công')
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [deletePermission, selectedPermission?.name, setOpenDialog, refetch, successMess, errorMess]
  )

  return {
    loadSearchRole,
    handleSearch,
    handlePostPermission,
    handlePutPermission,
    handleDeletePermission
  }
}
