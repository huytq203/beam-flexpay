/** Vòng đời màn đặt lại mật khẩu, tính từ lúc người dùng bấm link trong email. */
export const ResetPasswordStatus = {
  /** Đang hỏi BE xem token trong URL còn hiệu lực không. */
  VERIFYING: 'verifying',
  /** Không có token, token sai, hoặc token đã hết hạn. */
  INVALID: 'invalid',
  /** Không hỏi được máy chủ — chưa kết luận gì về token. */
  UNREACHABLE: 'unreachable',
  /** Token hợp lệ, cho phép nhập mật khẩu mới. */
  READY: 'ready',
  /** Mật khẩu đã được tiếp nhận, đang chờ xác thực OTP. */
  AWAITING_OTP: 'awaiting-otp',
  /** BE đã nhận mật khẩu mới. */
  SUCCESS: 'success'
} as const

export type ResetPasswordStatus =
  (typeof ResetPasswordStatus)[keyof typeof ResetPasswordStatus]
