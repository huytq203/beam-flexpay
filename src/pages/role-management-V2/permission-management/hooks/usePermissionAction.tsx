import { useCallback } from 'react'
import {
  useDeletePermissionAssignMutation,
  useLazyGetPermissionAssignQuery,
  usePostPermissionAvailableMutation
} from '@services/apiPermissionAssign'
import {
  useDeleteRoleMutation,
  useLazyGetMemberOfRoleQuery,
  useLazyGetRoleByKeyQuery,
  usePostRoleMutation,
  usePutRoleMutation
} from '@services/apiRole'
import { useGetPermissionQuery } from '@services/apiPermission'
import { useMessage } from '@hooks/useMessage'
import { DataRoleItem } from '@type/roleManagement'
import { SearchFormData } from '../components/FormSearch'
import { PermissionItem } from '@type/permissionManagement'
import { UserInfor } from '@type/userManagement'

interface UsePermissionActionParams {
  idRole: string | undefined
  editRoleData: DataRoleItem | null
  assignedPermissionNames: string[]
  setOpenModalAdd: (value: boolean) => void
  setOpenModalDetail: (value: boolean) => void
  setOpenModalPermission: (value: boolean) => void
  setModalDialog: (value: boolean) => void
  setEditRoleData: (value: DataRoleItem | null) => void
  setSelectMember: (value: UserInfor[] | undefined) => void
  setSelectRole: (value: PermissionItem[] | undefined) => void
  setIsLoadingDetail: (value: boolean) => void
  setIsSearchMode: (value: boolean) => void
  setSearchData: (value: any) => void
  setPage: (value: number) => void
  setIdRole: (value: string | undefined) => void
  setAllPermissions: (value: PermissionItem[]) => void
  setAssignedPermissionNames: (value: string[]) => void
  pageSize: number
  refetch: () => void
}

export const usePermissionAction = ({
  idRole,
  editRoleData,
  assignedPermissionNames,
  setOpenModalAdd,
  setOpenModalPermission,
  setModalDialog,
  setEditRoleData,
  setSelectMember,
  setSelectRole,
  setIsLoadingDetail,
  setIsSearchMode,
  setSearchData,
  setPage,
  setIdRole,
  setAllPermissions,
  setAssignedPermissionNames,
  pageSize,
  refetch
}: UsePermissionActionParams) => {
  const { successMess, errorMess } = useMessage()

  const { data: getPermission, isLoading: isLoadingPermission } =
    useGetPermissionQuery({})

  const [getMemberOfRole, { isLoading: loadingGetMember }] =
    useLazyGetMemberOfRoleQuery()

  const [getPermissionAssigned] = useLazyGetPermissionAssignQuery()

  const [postPermission] = usePostPermissionAvailableMutation()

  const [postRole] = usePostRoleMutation()

  const [putRole] = usePutRoleMutation()

  const [deletePermissionAssign] = useDeletePermissionAssignMutation()

  const [searchRole] = useLazyGetRoleByKeyQuery()

  const [deleteRole] = useDeleteRoleMutation()

  const handleDeleteRole = useCallback(async () => {
    try {
      await deleteRole(idRole).unwrap()
      setModalDialog(false)
      successMess('Xóa thành công')
      refetch()
    } catch (error: any) {
      errorMess(error?.data?.detail)
    }
  }, [deleteRole, idRole, setModalDialog, successMess, refetch, errorMess])

  const handlePostRole = useCallback(
    async (data: DataRoleItem) => {
      try {
        await postRole(data).unwrap()
        setOpenModalAdd(false)
        successMess('Thêm nhóm quyền thành công')
        refetch()
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [postRole, setOpenModalAdd, successMess, refetch, errorMess]
  )

  const handlePutRole = useCallback(
    async (data: { name: string; description: string }) => {
      if (!editRoleData?.id) return
      try {
        await putRole({ id: editRoleData.id, body: data }).unwrap()
        setOpenModalAdd(false)
        setEditRoleData(null)
        successMess('Cập nhật nhóm quyền thành công')
        refetch()
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [
      editRoleData?.id,
      putRole,
      setOpenModalAdd,
      setEditRoleData,
      successMess,
      refetch,
      errorMess
    ]
  )

  const handleSearch = useCallback(
    async (data: SearchFormData) => {
      if (!data.keyword) {
        setIsSearchMode(false)
        setSearchData(null)
        setPage(1)
        return
      }
      try {
        const searchParams = {
          page: 1,
          size: pageSize,
          sortBy: 'id',
          sortDirection: 'DESC',
          ...(data.keyword && { keyword: data.keyword }),
          ...(data.status && { keyword: data.status })
        }
        const result = await searchRole(searchParams).unwrap()
        setSearchData(result)
        setIsSearchMode(true)
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [pageSize, searchRole, setIsSearchMode, setSearchData, setPage, errorMess]
  )

  const handleCancel = useCallback(() => {
    setSelectRole(undefined)
    setOpenModalPermission(false)
  }, [setSelectRole, setOpenModalPermission])

  const handleDeletePermissionAssign = useCallback(
    async (permissionNames: string[]) => {
      try {
        await deletePermissionAssign({
          roleId: idRole,
          body: { permissionNames }
        }).unwrap()
        successMess('Xóa quyền thành công')
        setOpenModalPermission(false)
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [
      deletePermissionAssign,
      idRole,
      successMess,
      setOpenModalPermission,
      errorMess
    ]
  )

  const handleGetPermissionAssigned = useCallback(
    async (roleId: string) => {
      setIsLoadingDetail(true)
      try {
        const data = await getPermissionAssigned(roleId).unwrap()
        setSelectRole(data.data ?? [])
        setIdRole(roleId)
      } catch (error) {
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [getPermissionAssigned, setIsLoadingDetail, setSelectRole, setIdRole]
  )

  const handlePostPermission = useCallback(
    async (permissionNames: string[]) => {
      try {
        await postPermission({
          roleId: idRole,
          body: { permissionNames }
        }).unwrap()
        setOpenModalPermission(false)
        successMess('Gán quyền thành công')
      } catch (error: any) {
        errorMess(error?.data?.detail)
      }
    },
    [postPermission, idRole, setOpenModalPermission, successMess, errorMess]
  )

  const handleOpenPermissionModal = useCallback(
    async (roleId: string) => {
      setIsLoadingDetail(true)
      setIdRole(roleId)
      try {
        setAllPermissions(getPermission?.content ?? [])

        const assignedData = await getPermissionAssigned(roleId).unwrap()
        const assignedNames = (assignedData.data ?? []).map(
          (p: PermissionItem) => p.name
        )
        setAssignedPermissionNames(assignedNames)
      } catch (error) {
        setAllPermissions([])
        setAssignedPermissionNames([])
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [
      setIsLoadingDetail,
      setIdRole,
      getPermission?.content,
      getPermissionAssigned,
      setAllPermissions,
      setAssignedPermissionNames
    ]
  )

  const handleSubmitPermissionChanges = useCallback(
    async (selectedPermissions: string[]) => {
      const originalAssigned = new Set(assignedPermissionNames ?? [])
      const newSelected = new Set(selectedPermissions)

      const toAdd = selectedPermissions.filter((p) => !originalAssigned.has(p))
      const toRemove = (assignedPermissionNames ?? []).filter(
        (p) => !newSelected.has(p)
      )

      try {
        if (toAdd.length > 0) {
          await postPermission({
            roleId: idRole,
            body: { permissionNames: toAdd }
          }).unwrap()
        }

        if (toRemove.length > 0) {
          await deletePermissionAssign({
            roleId: idRole,
            body: { permissionNames: toRemove }
          }).unwrap()
        }

        setOpenModalPermission(false)
        successMess('Cập nhật quyền thành công')
      } catch (error: any) {
        errorMess(error?.data?.detail || 'Có lỗi xảy ra')
      }
    },
    [
      postPermission,
      deletePermissionAssign,
      idRole,
      setOpenModalPermission,
      successMess,
      errorMess
    ]
  )

  const handleGetMemberOfRole = useCallback(
    async (roleId: string) => {
      setIsLoadingDetail(true)
      try {
        const dataMember = await getMemberOfRole(roleId).unwrap()
        setSelectMember(dataMember?.content)
      } catch (error) {
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [getMemberOfRole, setIsLoadingDetail, setSelectMember]
  )

  return {
    getPermission,
    isLoadingPermission,
    loadingGetMember,
    handleDeleteRole,
    handlePostRole,
    handlePutRole,
    handleSearch,
    handleCancel,
    handleDeletePermissionAssign,
    handleGetPermissionAssigned,
    handlePostPermission,
    handleOpenPermissionModal,
    handleSubmitPermissionChanges,
    handleGetMemberOfRole
  }
}
