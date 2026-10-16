import { BooleanFilter } from '../constants/userAccount'
import type { SearchUserFormData } from '../types/UserManagement.type'

export const USER_FILTER_KEYS = ['keyword', 'emailVerified', 'status'] as const

export type UserFilterKey = (typeof USER_FILTER_KEYS)[number]

export type UserUrlFilters = Partial<Record<UserFilterKey, string>>

/**
 * Từ khoá tìm theo tên đăng nhập, họ tên hoặc email: có thể là email nên chỉ
 * giữ trong sessionStorage, không đưa lên URL.
 */
export const USER_SENSITIVE_KEYS = [
  'keyword'
] as const satisfies readonly UserFilterKey[]

const toBooleanFilter = (value?: string): BooleanFilter | undefined =>
  value === BooleanFilter.TRUE || value === BooleanFilter.FALSE
    ? value
    : undefined

/** Giá trị form dựng lại từ URL/bản sao; giá trị lạ bị bỏ thay vì gửi xuống BE. */
export const toSearchUserFormData = (
  filters: UserUrlFilters
): SearchUserFormData => ({
  keyword: filters.keyword ?? '',
  emailVerified: toBooleanFilter(filters.emailVerified),
  status: toBooleanFilter(filters.status)
})
