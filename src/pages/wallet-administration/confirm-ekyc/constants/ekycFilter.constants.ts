export const EKYC_FILTER_KEYS = [
  'keyword',
  'latestStatus',
  'profileStatus',
  'createdFrom',
  'createdTo'
] as const

export type EkycFilterKey = (typeof EKYC_FILTER_KEYS)[number]

export type EkycUrlFilters = Partial<Record<EkycFilterKey, string>>

/**
 * Từ khoá màn eKYC thường là SĐT hoặc số CCCD: chỉ giữ trong sessionStorage,
 * không đưa lên URL (lịch sử trình duyệt, log).
 */
export const EKYC_SENSITIVE_KEYS = [
  'keyword'
] as const satisfies readonly EkycFilterKey[]

/**
 * Giá trị riêng của FE: gửi hasProfile=false để chỉ lấy người chưa từng có hồ
 * sơ (verified=false còn gồm cả hồ sơ đã thu hồi / chờ xác thực lại).
 */
export const UNVERIFIED = 'UNVERIFIED'

/** Định dạng BE nhận cho createdFrom/createdTo. */
export const EKYC_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/** Chuỗi FormDatePicker (showTime) ghi vào form. */
export const PICKER_VALUE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'
