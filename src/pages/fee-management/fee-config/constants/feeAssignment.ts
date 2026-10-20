/**
 * Số nhỏ thắng khi hai chính sách cùng phủ một giao dịch. `FeePolicyCreateRequest`
 * mặc định 1000 nếu không gửi, nên form luôn phải điền tường minh.
 */
export const FEE_PRIORITY_OPTIONS = [
  { value: 1, label: 'Cao' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Thấp' },
  { value: 4, label: 'Mặc định' }
] as const

export const DEFAULT_PRIORITY = 4

/**
 * Đối tượng áp dụng của bản gán.
 *
 * Ba mức loại trừ nhau nên gộp vào một ô chọn thay vì để hai ô rời: người vận hành điền cả
 * phân khúc lẫn một ví cụ thể sẽ tạo ra bản gán hẹp hơn ý họ mà không có gì báo.
 *
 * Thứ tự khớp lệnh ở backend: cá nhân thắng nhóm, nhóm thắng mọi tiêu chí kênh.
 */
export const ASSIGNMENT_SCOPE = {
  ALL: 'ALL',
  SEGMENT: 'SEGMENT',
  SUBJECT: 'SUBJECT'
} as const

export type AssignmentScope =
  (typeof ASSIGNMENT_SCOPE)[keyof typeof ASSIGNMENT_SCOPE]

export const ASSIGNMENT_SCOPE_OPTIONS = [
  { value: ASSIGNMENT_SCOPE.ALL, label: 'Tất cả khách hàng' },
  { value: ASSIGNMENT_SCOPE.SEGMENT, label: 'Nhóm khách hàng' },
  { value: ASSIGNMENT_SCOPE.SUBJECT, label: 'Cá nhân' }
] as const
