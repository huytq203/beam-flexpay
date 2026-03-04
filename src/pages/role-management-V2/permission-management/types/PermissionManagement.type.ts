import { DataRoleItem } from '@type/roleManagement'

export type ModalType =
  | 'add'
  | 'edit'
  | 'delete'
  | 'viewPermissions'
  | 'assignPermissions'
  | 'viewMembers'
  | null

export type SelectedRole = DataRoleItem
