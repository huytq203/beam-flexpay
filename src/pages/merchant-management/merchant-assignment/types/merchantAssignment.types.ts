import type { AssignmentTarget } from '@/app/services/merchantAssignmentApi'

export type {
  AdminAssignment,
  AssignmentLevel
} from '@/app/services/merchantAssignmentApi'

/** Phạm vi đang xem: id Master/outlet kèm nhãn hiển thị trong tiêu đề và hộp thoại. */
export interface AssignmentScope extends AssignmentTarget {
  label: string
}

/** Người nội bộ chọn từ danh bạ admin (`users/managers`). */
export interface AdminUserOption {
  id: string
  /** Tên hiển thị (họ tên, rỗng thì dùng username). */
  name: string
  /** Username đăng nhập. */
  code: string
  email: string | null
  enabled: boolean
}
