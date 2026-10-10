import type { AllowedAction } from '@/app/schemas/transaction-review.schema'
import {
  StuckTransactionOutcome,
  type StuckTransactionUpdateResult
} from '@type/stuckTransaction.type'

const SUBMIT_FALLBACK =
  'Không thể chốt giao dịch. Hãy kiểm tra lại trạng thái lệnh và thử lại.'

export const describeResult = (
  result: StuckTransactionUpdateResult
): string => {
  if (result.newStatus === StuckTransactionOutcome.POSTED) {
    return 'Đã chốt giao dịch thành công và ghi bút toán vào sổ cái.'
  }
  const released =
    'Đã chốt giao dịch thất bại. Khoản tiền đang bị giữ đã được giải phóng.'
  return result.refundCode
    ? `${released} Đã sinh bản ghi hoàn tiền ${result.refundCode} (Thất bại hoàn tiền).`
    : released
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** `message` kiểu mã máy (BUSINESS_ERROR, VALIDATION_ERROR…) không nói được với người dùng. */
const isMachineCode = (text: string): boolean => /^[A-Z0-9_]+$/.test(text)

/** `detail` rồi `message` của BE, nguyên văn; `null` khi không có câu đọc được. */
export const readApiErrorText = (error: unknown): string | null => {
  if (!isRecord(error) || !isRecord(error.data)) return null
  for (const key of ['detail', 'message'] as const) {
    const text = error.data[key]
    if (typeof text === 'string' && text.trim() && !isMachineCode(text)) {
      return text
    }
  }
  return null
}

export const describeSubmitError = (error: unknown): string =>
  readApiErrorText(error) ?? SUBMIT_FALLBACK

export const isConflictError = (error: unknown): boolean =>
  isRecord(error) && error.status === 409

const isFinalAction = (action: AllowedAction): boolean =>
  action.status === StuckTransactionOutcome.POSTED ||
  action.status === StuckTransactionOutcome.FAILED

/** Chỉ POSTED/FAILED là thao tác của popup; action Review thuộc panel Review. */
export const getFinalActions = (
  actions: readonly AllowedAction[] | null | undefined
): AllowedAction[] => (actions ?? []).filter(isFinalAction)

export const BANK_CHECK_LABELS: Record<string, string> = {
  BANK_ACCEPTED: 'Ngân hàng đã chấp nhận',
  BANK_REJECTED: 'Ngân hàng từ chối',
  BANK_UNKNOWN: 'Chưa có kết quả từ ngân hàng',
  UNKNOWN: 'Chưa có kết quả từ ngân hàng',
  UNSUPPORTED: 'Chưa hỗ trợ kiểm tra tự động, cần đối soát tay',
  NOT_APPLICABLE: 'Không có ngân hàng để kiểm tra',
  LOCAL_TERMINAL: 'Giao dịch đã có kết quả cuối'
}

const UPLOAD_FALLBACK = 'Không tải được biên lai lên. Vui lòng thử lại.'

export const describeUploadError = (error: unknown): string =>
  readApiErrorText(error) ?? UPLOAD_FALLBACK

const RECEIPT_VIEW_FALLBACK = 'Không mở được biên lai. Vui lòng thử lại.'

export const describeReceiptViewError = (error: unknown): string =>
  readApiErrorText(error) ?? RECEIPT_VIEW_FALLBACK
