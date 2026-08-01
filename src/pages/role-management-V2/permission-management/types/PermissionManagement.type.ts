import { PermissionItem } from '@type/permissionManagement'

export type PermissionModalType = 'add' | 'edit' | 'delete' | null

export type SelectedPermission = PermissionItem

export interface SearchPermissionFormData {
  keyword: string
}
