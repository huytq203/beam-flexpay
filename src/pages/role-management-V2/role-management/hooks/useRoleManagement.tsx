import { useRoleManagementUI } from './useRoleManagementUI'
import { useRoleManagementPagination } from './useRoleManagementPagination'
import { useRoleManagementActions } from './useRoleManagementActions'
import { useRoleManagementDialog } from './useRoleManagementDialog'

export type { ModeAction } from './useRoleManagementUI'

export const useRoleManagement = () => {
  const ui = useRoleManagementUI()
  const pagination = useRoleManagementPagination()

  const actions = useRoleManagementActions({
    selectedPermission: ui.selectedPermission,
    setOpenModalAdd: ui.setOpenModalAdd,
    setOpenDialog: ui.setOpenDialog,
    setIsSearchMode: pagination.setIsSearchMode,
    setSearchData: pagination.setSearchData,
    setPage: pagination.setPage,
    pageSize: pagination.pageSize,
    refetch: pagination.refetch
  })

  const dialog = useRoleManagementDialog({
    modeAction: ui.modeAction,
    selectedPermission: ui.selectedPermission,
    setOpenDialog: ui.setOpenDialog,
    handleDeletePermission: actions.handleDeletePermission
  })

  return {
    openDialog: ui.openDialog,
    setOpenDialog: ui.setOpenDialog,
    page: pagination.page,
    setPage: pagination.setPage,
    pageSize: pagination.pageSize,
    setPageSize: pagination.setPageSize,
    modeAction: ui.modeAction,
    setModeAction: ui.setModeAction,
    openModalAdd: ui.openModalAdd,
    setOpenModalAdd: ui.setOpenModalAdd,
    selectedPermission: ui.selectedPermission,
    setSelectedPermission: ui.setSelectedPermission,
    getPermission: pagination.getPermission,
    loadGetRole: pagination.loadGetRole,
    dataSource: pagination.dataSource,
    totalElements: pagination.totalElements,
    typeText: dialog.typeText,
    typeFooter: dialog.typeFooter,
    handleSearch: actions.handleSearch,
    handlePostPermission: actions.handlePostPermission,
    handlePutPermission: actions.handlePutPermission,
    handleDeletePermission: actions.handleDeletePermission
  }
}
