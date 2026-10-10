export const HISTORY_STATUS_CLASS: Record<string, string> = {
  VERIFIED: 'border-green-300 bg-green-50 text-green-800',
  COMPLETED: 'border-green-300 bg-green-50 text-green-800',
  IN_PROGRESS: 'border-blue-300 bg-blue-50 text-blue-800',
  FAILED: 'border-red-300 bg-red-50 text-red-800',
  ABANDONED: 'border-slate-300 bg-slate-100 text-slate-700',
  PENDING: 'border-amber-300 bg-amber-50 text-amber-800',
  REJECTED: 'border-red-300 bg-red-50 text-red-800',
  INVALIDATED: 'border-slate-300 bg-slate-100 text-slate-700',
  EXPIRED: 'border-slate-300 bg-slate-100 text-slate-700',
  PENDING_REVIEW: 'border-amber-300 bg-amber-50 text-amber-800',
  MANUALLY_APPROVED: 'border-green-300 bg-green-50 text-green-800',
  MANUALLY_REJECTED: 'border-red-300 bg-red-50 text-red-800',
  SUPERSEDED: 'border-slate-300 bg-slate-100 text-slate-700'
}

export const STATUS_LABEL: Record<string, string> = {
  VERIFIED: 'Đã xác thực',
  COMPLETED: 'Thành công',
  INITIATED: 'Khởi tạo',
  IN_PROGRESS: 'Đang xử lý',
  FAILED: 'Thất bại',
  ABANDONED: 'Bỏ dở',
  PENDING: 'Chờ xử lý',
  REJECTED: 'Từ chối',
  INVALIDATED: 'Đã huỷ',
  EXPIRED: 'Hết hạn',
  PENDING_REVIEW: 'Chờ duyệt thủ công',
  MANUALLY_APPROVED: 'Đã duyệt thủ công',
  MANUALLY_REJECTED: 'Đã từ chối thủ công',
  SUPERSEDED: 'Đã thay thế'
}

export const STEP_LABEL: Record<string, string> = {
  DOCUMENT_CAPTURE: 'Chụp giấy tờ',
  OCR: 'Trích xuất thông tin',
  CARD_LIVENESS_FRONT: 'Kiểm tra mặt trước giấy tờ',
  CARD_LIVENESS_BACK: 'Kiểm tra mặt sau giấy tờ',
  FACE_CAPTURE: 'Chụp chân dung',
  FACE_LIVENESS: 'Kiểm tra người thật',
  FACE_LIVENESS_3D: 'Kiểm tra người thật 3D',
  FACE_MASK: 'Kiểm tra che mặt',
  FACE_COMPARE: 'Đối chiếu khuôn mặt',
  COMPLETED: 'Hoàn tất'
}

export const DOCUMENT_PROFILE_LABEL: Record<string, string> = {
  VERIFIED: 'Đã xác thực',
  INVALID: 'Đã thu hồi',
  REVERIFY_REQUIRED: 'Chờ xác thực lại'
}
