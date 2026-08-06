import { UserInfor } from '@type/userManagement'
import { BooleanFilter } from '../constants/userAccount'

export type ModalType =
  | 'add'
  | 'viewDetail'
  | 'delete'
  | 'lock'
  | 'unlock'
  | 'resetPass'
  | 'assignRoles'
  | 'resetPassword'
  | null

export type SelectedUser = UserInfor

export interface CreateAdminUserRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  phoneNumber: string
  roleIds: string[]
}

export interface UserRoleOption {
  value: string
  label: string
}

/** Giá trị 3 field lọc trên form (undefined = không lọc). */
export interface SearchUserFormData {
  keyword: string
  emailVerified?: BooleanFilter
  status?: BooleanFilter
}

/** Query param gửi lên GET /users/managers, field rỗng đã được loại bỏ. */
export interface UserQueryFilters {
  keyword?: string
  emailVerified?: boolean
  status?: boolean
}
