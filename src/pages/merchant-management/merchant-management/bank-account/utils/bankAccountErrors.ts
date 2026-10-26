import { getApiErrorDetail } from '@/app/utils/api-error'

/** Tên ErrorCode BE trả ở `message`; phân nhánh theo tên, không theo `status`. */
export const getApiErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object' || !('data' in error)) return
  const data = error.data
  if (!data || typeof data !== 'object' || !('message' in data)) return
  return typeof data.message === 'string' ? data.message : undefined
}

const USE_INACTIVE_HINT =
  'Hãy dùng “Ngừng” (Sửa → trạng thái Không hoạt động) thay vì xóa.'

const DELETE_ERRORS: Record<string, string> = {
  MERCHANT_BANK_ACCOUNT_WITHDRAWAL_IN_PROGRESS: `Tài khoản đang có lệnh rút tiền chưa hoàn tất nên không thể xóa. ${USE_INACTIVE_HINT}`,
  MERCHANT_BANK_ACCOUNT_HAS_TRANSACTIONS: `Tài khoản đã phát sinh giao dịch nên không thể xóa. ${USE_INACTIVE_HINT}`,
  MERCHANT_BANK_ACCOUNT_SETTLEMENT_UNATTRIBUTED: `Tài khoản còn liên quan tới quyết toán chưa đối soát xong nên không thể xóa. ${USE_INACTIVE_HINT}`,
  MERCHANT_BANK_ACCOUNT_HAS_CHANGE_HISTORY: `Tài khoản đã có lịch sử thay đổi nên phải giữ lại để đối soát. ${USE_INACTIVE_HINT}`
}

export const CHANGE_ALREADY_PENDING_MESSAGE =
  'Tài khoản đang có một yêu cầu thay đổi chờ duyệt. Hãy phê duyệt hoặc từ chối yêu cầu đó trước khi gửi thay đổi mới.'

export const PENDING_APPROVAL_MESSAGE =
  'Đã gửi yêu cầu thay đổi. Thay đổi chỉ có hiệu lực sau khi một quản trị viên khác phê duyệt.'

export const deleteErrorMessage = (error: unknown): string =>
  DELETE_ERRORS[getApiErrorCode(error) ?? ''] ??
  getApiErrorDetail(error, 'Không thể xóa tài khoản ngân hàng')

/** Lỗi khi sửa hoặc đặt mặc định: yêu cầu trùng có thông điệp riêng. */
export const changeErrorMessage = (error: unknown, fallback: string): string =>
  getApiErrorCode(error) === 'MERCHANT_BANK_ACCOUNT_CHANGE_ALREADY_PENDING'
    ? CHANGE_ALREADY_PENDING_MESSAGE
    : getApiErrorDetail(error, fallback)
