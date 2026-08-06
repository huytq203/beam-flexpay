import { BooleanFilter } from '../constants/userAccount'
import {
  SearchUserFormData,
  UserQueryFilters
} from '../types/UserManagement.type'

/**
 * Chuyển giá trị form sang query param của BE và loại bỏ field rỗng — gửi
 * `keyword=` hay `status=undefined` sẽ làm BE lọc nhầm thay vì lấy tất cả.
 */
export const toUserQueryFilters = (
  data: SearchUserFormData
): UserQueryFilters => {
  const keyword = data.keyword?.trim()

  return {
    ...(keyword ? { keyword } : {}),
    ...(data.emailVerified
      ? { emailVerified: data.emailVerified === BooleanFilter.TRUE }
      : {}),
    ...(data.status ? { status: data.status === BooleanFilter.TRUE } : {})
  }
}
