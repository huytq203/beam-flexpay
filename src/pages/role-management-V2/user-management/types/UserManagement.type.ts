import { UserInfor } from '@type/userManagement'

export type ModalType =
  | 'add'
  | 'edit'
  | 'viewDetail'
  | 'delete'
  | 'lock'
  | 'unlock'
  | 'resetPass'
  | 'assignRoles'
  | null

export type SelectedUser = UserInfor
