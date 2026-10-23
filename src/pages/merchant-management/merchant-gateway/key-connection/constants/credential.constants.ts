import type {
  ApiCredentialStatus,
  MerchantApiAuthMode,
  SignatureTestResultCode
} from '@/app/services/merchantGatewayApi'

type TagColor = 'success' | 'warning' | 'error' | 'default'

export const CREDENTIAL_STATUS: Record<
  ApiCredentialStatus,
  { label: string; color: TagColor }
> = {
  ACTIVE: { label: 'Hoạt động', color: 'success' },
  SUSPENDED: { label: 'Tạm dừng', color: 'warning' },
  REVOKED: { label: 'Đã thu hồi', color: 'error' },
  EXPIRED: { label: 'Hết hạn', color: 'default' }
}

export const CREDENTIAL_STATUS_OPTIONS = (
  Object.keys(CREDENTIAL_STATUS) as ApiCredentialStatus[]
).map((value) => ({ value, label: CREDENTIAL_STATUS[value].label }))

export const AUTH_MODE_LABEL: Record<MerchantApiAuthMode, string> = {
  HMAC_SHA256: 'HMAC-SHA256 (Secret Key)',
  RSA_SHA256: 'RSA-SHA256 (Public key)'
}

export const AUTH_MODE_OPTIONS = (
  Object.keys(AUTH_MODE_LABEL) as MerchantApiAuthMode[]
).map((value) => ({ value, label: AUTH_MODE_LABEL[value] }))

export const SIGNATURE_TEST_RESULT: Record<SignatureTestResultCode, string> = {
  VALID: 'Chữ ký hợp lệ',
  SIGNATURE_INVALID: 'Chữ ký không khớp',
  NON_CANONICAL_REQUEST: 'Chuỗi ký không đúng chuẩn',
  AUTH_MODE_MISMATCH: 'Sai cơ chế xác thực của key',
  INACTIVE_CREDENTIAL: 'Key không còn hoạt động'
}

// `verificationResult` của lịch sử là chuỗi tự do; giá trị lạ hiển thị nguyên văn.
export const SIGNATURE_HISTORY_RESULT: Record<string, string> = {
  VERIFIED: 'Hợp lệ',
  SIGNATURE_INVALID: 'Chữ ký không khớp',
  INACTIVE_CREDENTIAL: 'Key không hoạt động',
  STALE_TIMESTAMP: 'Timestamp quá hạn',
  IP_NOT_ALLOWED: 'IP không được phép',
  REQUEST_TOO_LARGE: 'Request quá lớn',
  INVALID_CANONICAL_REQUEST: 'Chuỗi ký không hợp lệ',
  RESPONSE_SIGNING_UNAVAILABLE: 'Không ký được phản hồi',
  REPLAYED: 'Request bị phát lại',
  CREDENTIAL_CHANGED: 'Key đã thay đổi',
  HMAC_MONEY_OUT_DENIED: 'HMAC không được chi tiền'
}

export const REVOKE_REASON_MIN = 10
export const REASON_MAX = 500
export const IP_WHITELIST_MAX = 50
export const SIGNATURE_HISTORY_PAGE_SIZE = 10
