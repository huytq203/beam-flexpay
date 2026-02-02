import { useMemo } from 'react'
import { PermissionManagementColumn } from '../columns/PermissionManagement.column'
import { ModeAction } from './usePermissionUi'
import { DataRoleItem } from '@type/roleManagement'

interface UsePermissionColumnParams {
  setOpenModalDetail: (value: boolean) => void
  setOpenModalAdd: (value: boolean) => void
  setModeAction: (value: ModeAction) => void
  setModalDialog: (value: boolean) => void
  handleGetMemberOfRole: (roleId: string) => void
  setOpenModalPermission: (value: boolean) => void
  handleGetPermissionAssigned: (roleId: string) => void
  setIdRole: (value: string | undefined) => void
  setSelectRoleItem: (value: any) => void
  currentUserRoles: string[]
  handleOpenPermissionModal: (roleId: string) => void
  setEditRoleData: (value: DataRoleItem | null) => void
}

export const usePermissionColumn = ({
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
}: UsePermissionColumnParams) => {
  const column = useMemo(
    () =>
      PermissionManagementColumn({
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
      }),
    [
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
    ]
  )

  return { column }
}
