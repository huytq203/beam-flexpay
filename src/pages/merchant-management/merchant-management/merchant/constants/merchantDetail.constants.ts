import type {
  MerchantAuditLogAction,
  MerchantRejectionReasonCode
} from '@type/merchant'

export type MerchantDetailAction =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'lock'
  | 'unlock'

export const MERCHANT_ACTION_LABEL: Record<MerchantDetailAction, string> = {
  submit: 'Gửi duyệt hồ sơ',
  approve: 'Phê duyệt hồ sơ',
  reject: 'Từ chối hồ sơ',
  lock: 'Khóa merchant',
  unlock: 'Mở khóa merchant'
}

/** Nhãn dự phòng khi hiển thị mã lý do từ chối trong lịch sử. */
export const REJECTION_REASON_LABEL: Record<
  MerchantRejectionReasonCode,
  string
> = {
  BLURRED_IMAGE: 'Ảnh mờ',
  INCORRECT_INFORMATION: 'Thông tin sai',
  MISSING_DOCUMENT: 'Thiếu giấy tờ',
  OTHER: 'Lý do khác'
}

export const AUDIT_ACTION_LABEL: Record<MerchantAuditLogAction, string> = {
  INSERT: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  APPROVE: 'Phê duyệt',
  REJECT: 'Từ chối',
  LOCK: 'Khóa',
  UNLOCK: 'Mở khóa',
  TERMINATE: 'Chấm dứt',
  VIEW_DOCUMENT: 'Xem tài liệu',
  RESET_PASSWORD: 'Đặt lại mật khẩu',
  GRANT_PERMISSION: 'Cấp quyền',
  EXPORT: 'Xuất dữ liệu'
}

export const HISTORY_PAGE_SIZE = 10
