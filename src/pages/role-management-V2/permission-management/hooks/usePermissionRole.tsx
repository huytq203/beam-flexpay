import { ButtonComponent } from '@components/common'
import { useGetPermissionQuery } from '@services/apiPermission'
import {
  useDeleteRoleMutation,
  useLazyGetMemberOfRoleQuery,
  useLazyGetRoleByKeyQuery,
  usePostRoleMutation
} from '@services/apiRole'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRoleItem } from '@type/roleManagement'
import { useMemo, useState } from 'react'
import { PermissionManagementColumn } from '../PermissionManagement.column'
import { UserInfor } from '@type/userManagement'
import {
  useDeletePermissionAssignMutation,
  useLazyGetPermissionAssignQuery,
  useLazyGetPermissionAvailableQuery,
  usePostPermissionAvailableMutation
} from '@services/apiPermissionAsign'
import { PermissionItem } from '@type/permissionManagement'
import { useMessage } from '@hooks/useMessage'
import { useAppSelector } from '@hooks/hook'
import { SearchFormData } from '@pages/role-management-V2/permission-management/components/FormSearch'
import { RoleData } from '@type/roleManagementV2'

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalDetail, setOpenModalDetail] = useState(false)
  const [openModalPermission, setOpenModalPermission] = useState(false)
  const [modeAction, setModeAction] = useState<ModeAction>('')
  const [modalDialog, setModalDialog] = useState(false)
  const [selectMember, setSelectMember] = useState<UserInfor[] | undefined>(undefined)
  const [selectRole, setSelectRole] = useState<PermissionItem[] | undefined>(undefined)
  const [selectRoleItem, setSelectRoleItem] = useState<PermissionItem | undefined>(undefined)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [idRole, setIdRole] = useState<string | undefined>(undefined)
  const [searchData, setSearchData] = useState<RoleData | null>(null)

  // hook
  const { errorMess, successMess } = useMessage()
  const { profile } = useAppSelector((state) => state.auth)

  // Lấy danh sách roles của user hiện tại từ JWT
  // roles từ JWT có dạng: ["ACCOUNTANT", "SUPER_ADMIN"]
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
  const [getPermissionAvailable] = useLazyGetPermissionAvailableQuery()
  const [getPermissionAssigned] = useLazyGetPermissionAssignQuery()
  const [postPermission] = usePostPermissionAvailableMutation()
  const [postRole] = usePostRoleMutation()
  const [deletePermissionAssign] = useDeletePermissionAssignMutation()
  const [searchRole] = useLazyGetRoleByKeyQuery()
  const [deleteRole] = useDeleteRoleMutation()

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

  const handleGetPermissionAvailable =async (roleId: string) => {
    setIsLoadingDetail(true)
    try {
      const data = await getPermissionAvailable(roleId).unwrap()
      setSelectRole(data.data ?? [])
      setIdRole(roleId)
    } catch (error) {
    } finally {
      setIsLoadingDetail(false)
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

  const column = useMemo(() => PermissionManagementColumn({
    setOpenModalDetail,
    setOpenModalAdd,
    setModeAction,
    setModalDialog,
    handleGetMemberOfRole,
    handleGetPermissionAvailable,
    setOpenModalPermission,
    handleGetPermissionAssigned,
    setIdRole,
    setSelectRoleItem,
    currentUserRoles
  }), [handleGetMemberOfRole, handleGetPermissionAvailable, handleGetPermissionAssigned, currentUserRoles])

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
    openModalAdd,
    setOpenModalAdd,
    openModalDetail,
    setOpenModalDetail,
    modeAction,
    setModeAction,
    modalDialog,
    setModalDialog,
    selectMember,
    openModalPermission,
    setOpenModalPermission,
    pageSize,
    setPageSize,
    page,
    setPage,
    dataSource,
    column,
    getTypeFooter,
    typeText,
    getPermission,
    loadingGetMember,
    isLoadingDetail,
    selectRole,
    dataPermission,
    totalElements,
    currentData,
    handleGetMemberOfRole,
    handleGetPermissionAvailable,
    hanldePostPermission,
    handleDeletePermissionAssign,
    handleCancel,
    handleSearch,
    handlePostRole,
    handleDeleteRole
  }
}
