import type { ApiCredential } from '@/app/services/merchantGatewayApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'

/** Tách danh sách IP/CIDR người dùng nhập theo dòng, dấu phẩy hoặc chấm phẩy. */
export const parseIps = (value: string): string[] =>
  value
    .split(/[\s,;]+/)
    .map((ip) => ip.trim())
    .filter(Boolean)

export const dateLabel = (value?: string | null, empty = 'Chưa có'): string =>
  value ? formatUTCToLocalDateTime(value) : empty

/** `rowRevision` gửi lại làm `expectedRevision`; thiếu thì để BE báo xung đột. */
export const revisionOf = (credential: ApiCredential): number =>
  credential.rowRevision ?? 0

/** Đọc tên ErrorCode (`message`) từ lỗi RTK Query của BE merchant. */
export const readApiErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object' || !('data' in error)) return
  const { data } = error
  if (!data || typeof data !== 'object' || !('message' in data)) return
  return typeof data.message === 'string' ? data.message : undefined
}

/**
 * Lỗi nằm ở bước xác minh OTP: giữ hộp thoại OTP mở để nhập lại hoặc xin mã
 * mới. 5732 là mã sai/hết hạn; 5731 và nhóm EXTERNAL_API_* nghĩa là mã đã bị
 * tiêu, phải gửi lại mã.
 */
export const isOtpStepError = (code?: string): boolean =>
  code === 'MERCHANT_SENSITIVE_OTP_INVALID' ||
  code === 'MERCHANT_SENSITIVE_OTP_REQUIRED' ||
  Boolean(code?.startsWith('EXTERNAL_API_'))

export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export const isPemPublicKey = (value: string): boolean =>
  /-----BEGIN [A-Z ]*PUBLIC KEY-----/.test(value)
