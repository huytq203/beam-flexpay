import { useMemo } from 'react'
import { useAppSelector } from '@hooks/hook'
import usePermissionUi from './usePermissionUi'
import { usePermissionPagination } from './usePermissionPagination'
import { usePermissionAction } from './usePermissionAction'
import { usePermissionDialog } from './usePermissionDialog'
import { usePermissionColumn } from './usePermissionColumn'

export type { ModeAction } from './usePermissionUi'

export const usePermissionRole = () => {
  const { profile } = useAppSelector((state) => state.auth)
  const currentUserRoles: string[] = profile?.roles ?? []

  const ui = usePermissionUi()
  const pagination = usePermissionPagination()

  const actions = usePermissionAction({
    idRole: ui.idRole,
    editRoleData: ui.editRoleData,
    assignedPermissionNames: ui.assignedPermissionNames,
    setOpenModalAdd: ui.setOpenModalAdd,
    setOpenModalDetail: ui.setOpenModalDetail,
    setOpenModalPermission: ui.setOpenModalPermission,
    setModalDialog: ui.setModalDialog,
    setEditRoleData: ui.setEditRoleData,
    setSelectMember: ui.setSelectMember,
    setSelectRole: ui.setSelectRole,
    setIsLoadingDetail: ui.setIsLoadingDetail,
    setIsSearchMode: pagination.setIsSearchMode,
    setSearchData: pagination.setSearchData,
    setPage: pagination.setPage,
    setIdRole: ui.setIdRole,
    setAllPermissions: ui.setAllPermissions,
    setAssignedPermissionNames: ui.setAssignedPermissionNames,
    pageSize: pagination.pageSize,
    refetch: pagination.refetch
  })

  const dialog = usePermissionDialog({
    modeAction: ui.modeAction,
    selectRoleItem: ui.selectRoleItem,
    setModalDialog: ui.setModalDialog,
    handleDeleteRole: actions.handleDeleteRole
  })

  const columnHook = usePermissionColumn({
    setOpenModalDetail: ui.setOpenModalDetail,
    setOpenModalAdd: ui.setOpenModalAdd,
    setModeAction: ui.setModeAction,
    setModalDialog: ui.setModalDialog,
    handleGetMemberOfRole: actions.handleGetMemberOfRole,
    setOpenModalPermission: ui.setOpenModalPermission,
    handleGetPermissionAssigned: actions.handleGetPermissionAssigned,
    setIdRole: ui.setIdRole,
    setSelectRoleItem: ui.setSelectRoleItem,
    currentUserRoles,
    handleOpenPermissionModal: actions.handleOpenPermissionModal,
    setEditRoleData: ui.setEditRoleData
  })

  const dataPermission = useMemo(() => ui.selectRole ?? [], [ui.selectRole])

  return {
    openModalAdd: ui.modalState.add,
    openModalDetail: ui.modalState.detail,
    openModalPermission: ui.modalState.permission,
    modalDialog: ui.modalState.dialog,

    modeAction: ui.modeAction,
    selectMember: ui.selectMember,

    pageSize: pagination.pageSize,
    page: pagination.page,
    setOpenModalAdd: ui.setOpenModalAdd,
    setOpenModalDetail: ui.setOpenModalDetail,
    setModeAction: ui.setModeAction,
    setModalDialog: ui.setModalDialog,
    setOpenModalPermission: ui.setOpenModalPermission,
    setPageSize: pagination.setPageSize,
    setPage: pagination.setPage,

    dataSource: pagination.dataSource,
    column: columnHook.column,
    typeText: dialog.typeText,
    getPermission: actions.getPermission,
    loadingGetMember: actions.loadingGetMember,
    isLoadingDetail: ui.isLoadingDetail,
    selectRole: ui.selectRole,
    dataPermission,
    totalElements: pagination.totalElements,
    currentData: pagination.currentData,
    getTypeFooter: dialog.getTypeFooter,

    handleGetMemberOfRole: actions.handleGetMemberOfRole,
    handlePostPermission: actions.handlePostPermission,
    handleDeletePermissionAssign: actions.handleDeletePermissionAssign,
    handleCancel: actions.handleCancel,
    handleSearch: actions.handleSearch,
    handlePostRole: actions.handlePostRole,
    handleDeleteRole: actions.handleDeleteRole,
    allPermissions: ui.allPermissions,
    assignedPermissionNames: ui.assignedPermissionNames,
    handleOpenPermissionModal: actions.handleOpenPermissionModal,
    handleSubmitPermissionChanges: actions.handleSubmitPermissionChanges,
    editRoleData: ui.editRoleData,
    setEditRoleData: ui.setEditRoleData,
    handlePutRole: actions.handlePutRole,
    isLoadingRole: pagination.isLoadingRole,
    isLoadingPermission: actions.isLoadingPermission
  }
}
