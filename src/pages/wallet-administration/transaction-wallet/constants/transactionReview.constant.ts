export const CASH_IN_TYPE = 'CASH_IN'

/**
 * Nhóm giao dịch treo được đưa vào Review (không gồm `PROCESSING`: lệnh đang ghi sổ
 * thì chờ rồi kiểm tra lại). Lệnh đang REVIEW vẫn hiện theo trạng thái bút toán ở
 * wallet-core, nên đây cũng là nhóm trạng thái hiển thị panel Review.
 */
export const REVIEW_ELIGIBLE_STATUSES: readonly string[] = [
  'PENDING',
  'AUTHORIZED',
  'POSTING',
  'CREDIT_PENDING',
  'CREDIT_FAILED',
  'RECONCILIATION_REQUIRED'
]

export const REVIEW_REASON_MAX = 500
export const REVIEW_NOTE_MAX = 500
export const REVIEW_CODE_MAX = 50

export const REVIEW_REJECT_OPTIONS = [
  { value: 'CANCEL_ONLY', label: 'Chỉ hủy giao dịch' },
  { value: 'REFUND', label: 'Hủy và hoàn tiền' }
] as const

export const EMPTY_BANK_CONFIRMATION = {
  confirmationChannel: '',
  confirmationReference: '',
  confirmedAt: '',
  bankReference: '',
  valueDate: '',
  bankBookedAt: ''
}
