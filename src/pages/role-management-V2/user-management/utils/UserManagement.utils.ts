import { BooleanFilter } from '../constants/userAccount'
import {
  SearchUserFormData,
  UserQueryFilters
} from '../types/UserManagement.type'
import dayjs from 'dayjs'

export const formatUserTimestamp = (
  value: string | number | Date | null | undefined
): string => {
  if (value === null || value === undefined || value === '') return '--'

  const timestamp = dayjs(value)
  return timestamp.isValid() ? timestamp.format('DD/MM/YYYY HH:mm:ss') : '--'
}

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
