import { PermissionItem } from '@type/permissionManagement'
import { DataRoleItem } from '@type/roleManagement'
import { RoleData } from '@type/roleManagementV2'
import { UserInfor } from '@type/userManagement'
import React, { useState } from 'react'

export type ModeAction =
  | 'edit'
  | 'add'
  | 'view'
  | 'delete'
  | 'lock'
  | 'unlock'
  | 'permission'
  | ''

const usePermissionUi = () => {
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [idRole, setIdRole] = useState<string | undefined>(undefined)
  const [modeAction, setModeAction] = useState<ModeAction>('')
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
  const [searchData, setSearchData] = useState<RoleData | null>(null)
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([])
  const [assignedPermissionNames, setAssignedPermissionNames] = useState<string[]>([])



  const [editRoleData, setEditRoleData] = useState<DataRoleItem | null>(null)
  const setOpenModalAdd = (isOpen: boolean) =>
    setModalState((prev) => ({ ...prev, add: isOpen }))
  const setOpenModalDetail = (isOpen: boolean) =>
    setModalState((prev) => ({ ...prev, detail: isOpen }))
  const setOpenModalPermission = (isOpen: boolean) =>
    setModalState((prev) => ({ ...prev, permission: isOpen }))
  const setModalDialog = (isOpen: boolean) =>
    setModalState((prev) => ({ ...prev, dialog: isOpen }))

  return {
    modalState,
    setModalState,
    modeAction,
    setModeAction,
    editRoleData,
    setEditRoleData,
    setOpenModalAdd,
    setOpenModalDetail,
    setOpenModalPermission,
    setModalDialog,
    idRole,
    setIdRole,
    isSearchMode,
    setIsSearchMode,
    selectMember,
    setSelectMember,
    selectRole,
    setSelectRole,
    selectRoleItem,
    setSelectRoleItem,
    isLoadingDetail,
    setIsLoadingDetail,
    searchData,
    setSearchData,
    allPermissions,
    setAllPermissions,
    assignedPermissionNames,
    setAssignedPermissionNames
  }
}

export default usePermissionUi
