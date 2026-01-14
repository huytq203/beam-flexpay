import { ButtonComponent } from '@components/common'
import { useGetPermissionQuery, useLazyGetPermissionQuery } from '@services/apiPermission'
import {
  useDeleteRoleMutation,
  useLazyGetMemberOfRoleQuery,
  useLazyGetRoleByKeyQuery,
  usePostRoleMutation,
  usePutRoleMutation
} from '@services/apiRole'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRoleItem } from '@type/roleManagement'
import { useMemo, useState } from 'react'
import { PermissionManagementColumn } from '../configs/PermissionManagement.column'
import { UserInfor } from '@type/userManagement'
import {
  useDeletePermissionAssignMutation,
  useLazyGetPermissionAssignQuery,
  useLazyGetPermissionAvailableQuery,
  usePostPermissionAvailableMutation
} from '@services/apiPermissionAssign'
import { PermissionItem } from '@type/permissionManagement'
import { useMessage } from '@hooks/useMessage'
import { useAppSelector } from '@hooks/hook'
import { SearchFormData } from '@pages/role-management-V2/permission-management/components/FormSearch'
import { RoleData } from '@type/roleManagementV2'
import usePagination from '@hooks/usePagination'

export type ModeAction =
  | 'edit'
  | 'add'
  | 'view'
  | 'delete'
  | 'lock'
  | 'unlock'
  | 'permission'
  | ''

export const usePermissionRole = () => {
  // state
  const [isSearchMode, setIsSearchMode] = useState(false)
  
  const [modalState, setModalState] = useState({
    add: false,
    detail: false,
    permission: false,
    dialog: false
  })

  const [selectMember, setSelectMember] = useState<UserInfor[] | undefined>(undefined)
  const [selectRole, setSelectRole] = useState<PermissionItem[] | undefined>(undefined)
  const [selectRoleItem, setSelectRoleItem] = useState<PermissionItem | undefined>(undefined)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [idRole, setIdRole] = useState<string | undefined>(undefined)
  const [searchData, setSearchData] = useState<RoleData | null>(null)
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([])
  const [assignedPermissionNames, setAssignedPermissionNames] = useState<string[]>([])
  const [editRoleData, setEditRoleData] = useState<DataRoleItem | null>(null)
  const [modeAction, setModeAction] = useState<ModeAction>('')

  // hook
  const { errorMess, successMess } = useMessage()
  const { profile } = useAppSelector((state) => state.auth)
  const { page, setPage, pageSize, setPageSize } = usePagination()
 
  const currentUserRoles: string[] = profile?.roles ?? []

  // api
  const defaultPagination = useMemo(() => ({
    page: page,
    size: pageSize,
    sortBy: 'id',
    sortDirection: 'DESC'
  }), [page, pageSize])
  const { data: getRole, refetch } = useGetRoleQuery(defaultPagination)
  const { data: getPermission } = useGetPermissionQuery({})
  const [getMemberOfRole, { isLoading: loadingGetMember }] = useLazyGetMemberOfRoleQuery()
  const [getPermissionAssigned] = useLazyGetPermissionAssignQuery()
  const [getAllPermissions] = useLazyGetPermissionQuery()
  const [postPermission] = usePostPermissionAvailableMutation()
  const [postRole] = usePostRoleMutation()
  const [putRole] = usePutRoleMutation()
  const [deletePermissionAssign] = useDeletePermissionAssignMutation()
  const [searchRole] = useLazyGetRoleByKeyQuery()
  const [deleteRole] = useDeleteRoleMutation()

  // Modal handlers
  const setOpenModalAdd = (isOpen: boolean) => setModalState(prev => ({ ...prev, add: isOpen }))
  const setOpenModalDetail = (isOpen: boolean) => setModalState(prev => ({ ...prev, detail: isOpen }))
  const setOpenModalPermission = (isOpen: boolean) => setModalState(prev => ({ ...prev, permission: isOpen }))
  const setModalDialog = (isOpen: boolean) => setModalState(prev => ({ ...prev, dialog: isOpen }))

  // handlers
  const handleDeleteRole =async () => {
    try {
      await deleteRole(idRole).unwrap()
      setModalDialog(false)
      successMess('Xóa thành công')
      refetch()
    } catch (error: any) {
      errorMess(error?.data?.detail)
    }
  }

  const handlePostRole =async (data: DataRoleItem) => {
    try {
      await postRole(data).unwrap()
      setOpenModalAdd(false)
      successMess('Thêm nhóm quyền thành công')
      refetch()
    } catch (error: any) {
      errorMess(error?.data?.detail)
    }
  }

  const handlePutRole = async (data: { name: string; description: string }) => {
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
  }

  const handleSearch =async (data: SearchFormData) => {
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
    } catch (error) { }
  }

  const handleCancel =() => {
    setSelectRole(undefined)
    setOpenModalPermission(false)
  }

  const handleDeletePermissionAssign =async (permissionNames: string[]) => {
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
  }

  const handleGetPermissionAssigned =async (roleId: string) => {
    setIsLoadingDetail(true)
    try {
      const data = await getPermissionAssigned(roleId).unwrap()
      setSelectRole(data.data ?? [])
      setIdRole(roleId)
    } catch (error) {
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const hanldePostPermission =async (permissionNames: string[]) => {
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
  }

  // Handler for "Phân quyền" button - fetches ALL permissions and marks assigned ones
  const handleOpenPermissionModal = async (roleId: string) => {
    setIsLoadingDetail(true)
    setIdRole(roleId)
    try {
      // Fetch all permissions in the system
      const allPermsData = await getAllPermissions({}).unwrap()
      setAllPermissions(allPermsData?.content ?? [])
      
      // Fetch permissions already assigned to this role
      const assignedData = await getPermissionAssigned(roleId).unwrap()
      const assignedNames = (assignedData.data ?? []).map((p: PermissionItem) => p.name)
      setAssignedPermissionNames(assignedNames)
    } catch (error) {
      setAllPermissions([])
      setAssignedPermissionNames([])
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Handler to submit permission changes when OK is clicked (batch mode)
  const handleSubmitPermissionChanges = async (selectedPermissions: string[]) => {
    const originalAssigned = new Set(assignedPermissionNames)
    const newSelected = new Set(selectedPermissions)
    
    // Permissions to add (in selected but not in original)
    const toAdd = selectedPermissions.filter(p => !originalAssigned.has(p))
    // Permissions to remove (in original but not in selected)
    const toRemove = assignedPermissionNames.filter(p => !newSelected.has(p))
    
    try {
      // Add new permissions
      if (toAdd.length > 0) {
        await postPermission({
          roleId: idRole,
          body: { permissionNames: toAdd }
        }).unwrap()
      }
      
      // Remove unchecked permissions
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
  }

  const handleGetMemberOfRole =async (roleId: string) => {
    setIsLoadingDetail(true)
    try {
      const dataMember = await getMemberOfRole(roleId).unwrap()
      setSelectMember(dataMember?.content)
    } catch (error) {
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // computed
  const currentData = useMemo(() => isSearchMode ? searchData : getRole, [isSearchMode, searchData, getRole])

  const totalElements = currentData?.totalElements

  const dataPermission = useMemo(() => selectRole ?? [], [selectRole])

  const dataSource: DataRoleItem[] = useMemo(() => {
    return currentData?.content.map((item, idx) => ({
      ...item,
      no: idx + 1
    })) ?? []
  }, [currentData])

  const column =  PermissionManagementColumn({
    setOpenModalDetail,
    setOpenModalAdd,
    setModeAction,
    setModalDialog,
    handleGetMemberOfRole,
    setOpenModalPermission,
    handleGetPermissionAssigned,
    setIdRole,
    setSelectRoleItem,
    currentUserRoles,
    handleOpenPermissionModal,
    setEditRoleData
  })

  const getTypeFooter = (
    onCancel: () => void,
    onOk: () => void
  ): Partial<Record<ModeAction, JSX.Element>> => ({
    delete: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' onClick={onCancel} />
        <ButtonComponent type='primary' danger content='Delete' onClick={onOk} />
      </div>
    ),
    view: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' onClick={onCancel} />
      </div>
    )
  })

  const typeText = useMemo((): Partial<Record<ModeAction, JSX.Element>> => ({
    delete: (
      <span>
        Bạn có chắc chắn muốn xóa nhóm quyền{' '}
        <span className='font-bold'>{selectRoleItem?.name}</span> không? Hành động này không thể
        hoàn tác.
      </span>
    ),
    lock: (
      <span>
        Bạn có chắc chắn muốn khóa nhóm quyền{' '}
        <span className='font-bold'>{selectRoleItem?.name}</span> không?
      </span>
    ),
    unlock: (
      <span>
        Bạn có chắc chắn muốn mở khóa{' '}
        <span className='font-bold'>{selectRoleItem?.name}</span> không?
      </span>
    )
  }), [selectRoleItem?.name])

  return {
    openModalAdd: modalState.add,
    openModalDetail: modalState.detail,
    openModalPermission: modalState.permission,
    modalDialog: modalState.dialog,
    
    modeAction,
    selectMember,

    pageSize,
    page,
    setOpenModalAdd,
    setOpenModalDetail,
    setModeAction,
    setModalDialog,
    setOpenModalPermission,
    setPageSize,
    setPage,

    dataSource,
    column,
    typeText,
    getPermission,
    loadingGetMember,
    isLoadingDetail,
    selectRole,
    dataPermission,
    totalElements,
    currentData,
    getTypeFooter,

    handleGetMemberOfRole,
    hanldePostPermission,
    handleDeletePermissionAssign,
    handleCancel,
    handleSearch,
    handlePostRole,
    handleDeleteRole,
    // New exports for unified permission flow
    allPermissions,
    assignedPermissionNames,
    handleOpenPermissionModal,
    handleSubmitPermissionChanges,
    // Exports for edit role
    editRoleData,
    setEditRoleData,
    handlePutRole
  }
}
