import type {
  ReconciliationOutcome,
  ReconciliationTrigger
} from '../types/reconciliation.types'

/** `cause` và `treatment` bắt buộc đủ 10 ký tự sau trim (BE kiểm trong service). */
export const MIN_NOTE_LENGTH = 10
export const MAX_NOTE_LENGTH = 1000
export const PAGE_SIZE = 10

export const RECONCILIATION_TAB_KEYS = {
  pauses: 'pauses',
  results: 'results'
} as const

export const TRIGGER_LABEL: Record<ReconciliationTrigger, string> = {
  DAILY: 'Chạy ban đêm',
  ON_DEMAND: 'Chạy thủ công',
  RECHECK: 'Chạy lại khi xác nhận'
}

export const OUTCOME_LABEL: Record<
  ReconciliationOutcome,
  { label: string; color: 'success' | 'error' | 'warning' }
> = {
  BALANCED: { label: 'Cân', color: 'success' },
  MISMATCH: { label: 'Lệch', color: 'error' },
  UNAVAILABLE: { label: 'Chưa đối soát được', color: 'warning' }
}

/** Phương trình 7-9 đếm số vi phạm thay vì tiền. */
export const FIRST_COUNT_EQUATION_NO = 7

export const UNAVAILABLE_RUN_TEXT =
  'Chưa đọc được số dư từ sổ cái nên chưa đối soát được và không mở tạm dừng nào. Vui lòng thử lại sau.'
export const UNAVAILABLE_REPORT_TEXT =
  'Chưa đọc được số dư từ sổ cái nên chưa lập được báo cáo. Vui lòng thử lại sau.'

export const FREEZE_NOT_APPLIED_NOTE =
  'Chưa có nghiệp vụ đóng băng theo lệnh nên dòng này luôn bằng 0 và không phản ánh kết quả đối soát.'

export const OTP_CONSUMED_NOTICE =
  'Mã OTP vừa nhập đã được sử dụng, hãy xin mã OTP mới để thử lại.'
