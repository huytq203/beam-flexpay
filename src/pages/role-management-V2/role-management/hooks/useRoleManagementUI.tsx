import { useState } from 'react'
import { RoleDataItem } from '@type/roleManagementV2'

export type ModeAction = 'add' | 'update' | 'delete' | 'lock' | 'unlock' | ''

export const useRoleManagementUI = () => {
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [modeAction, setModeAction] = useState<ModeAction>('')
  const [selectedPermission, setSelectedPermission] = useState<
    RoleDataItem | undefined
  >(undefined)

  return {
    openModalAdd,
    setOpenModalAdd,
    openDialog,
    setOpenDialog,
    modeAction,
    setModeAction,
    selectedPermission,
    setSelectedPermission
  }
}
