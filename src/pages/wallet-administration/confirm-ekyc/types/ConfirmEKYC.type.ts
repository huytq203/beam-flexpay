import type { JSX } from 'react'
export type SvgOptions = {
  size?: number
  width?: number
  height?: number
  className?: string
}

export interface props {
  svg: (value: string, options?: SvgOptions) => JSX.Element
}

export const statusMap: Record<string, { color: string; label: string }> = {
  VERIFIED: { color: 'success', label: 'Đã xác thực' },
  INITIATED: { color: 'default', label: 'Khởi tạo' },
  COMPLETED: { color: 'success', label: 'Thành công' },
  PENDING: { color: 'warning', label: 'Chờ duyệt' },
  IN_PROGRESS: { color: 'processing', label: 'Đang xử lý' },
  FAILED: { color: 'error', label: 'Thất bại' },
  EXPIRED: { color: 'default', label: 'Hết hạn' },
  ABANDONED: { color: 'default', label: 'Bỏ dở' },
  REJECTED: { color: 'error', label: 'Từ chối' },
  INVALIDATED: { color: 'default', label: 'Đã huỷ' },
  PENDING_REVIEW: { color: 'warning', label: 'Chờ duyệt thủ công' },
  MANUALLY_APPROVED: { color: 'success', label: 'Đã duyệt thủ công' },
  MANUALLY_REJECTED: { color: 'error', label: 'Đã từ chối thủ công' },
  SUPERSEDED: { color: 'default', label: 'Đã thay thế' }
}

// Kết quả xác thực chung cuộc (profileStatus của dòng). null/undefined = chưa xác thực.
export const profileStatusMap: Record<
  string,
  { className: string; label: string }
> = {
  VERIFIED: {
    className: 'text-green-700 bg-green-50 border border-green-400',
    label: 'Đã xác thực'
  },
  INVALID: {
    className: 'text-red-600 bg-red-50 border border-red-400',
    label: 'Đã thu hồi'
  },
  REVERIFY_REQUIRED: {
    className: 'text-amber-800 bg-amber-50 border border-amber-400',
    label: 'Chờ xác thực lại'
  }
}

export const genderMap: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ'
}
