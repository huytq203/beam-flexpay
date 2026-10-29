import { z } from 'zod'

/**
 * Kết quả admin chốt cho một lệnh chi thủ công (ngân hàng chưa có API).
 * - `SUCCESS`: đã chuyển khoản tay thành công, phải kèm mã tham chiếu + ảnh UNC.
 * - `FAILED`: chuyển khoản tay không thành, chỉ cần lý do.
 */
export const ManualPayoutOutcome = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
} as const

export type ManualPayoutOutcome =
  (typeof ManualPayoutOutcome)[keyof typeof ManualPayoutOutcome]

/** Ràng buộc độ dài khớp BE (`update-status` và `manual-payout`). */
export const MANUAL_PAYOUT_REFERENCE_MAX_LENGTH = 50
export const MANUAL_PAYOUT_NOTE_MAX_LENGTH = 500

/** Biên lai đã upload: `receiptKey` gửi BE, hai trường còn lại chỉ để hiển thị. */
const receiptSchema = z.object({
  receiptKey: z.string(),
  fileName: z.string(),
  sizeBytes: z.number()
})

/**
 * Form chốt chi thủ công. Trường `receipt` cố ý trùng tên và hình dạng với form
 * cập nhật giao dịch treo để dùng lại `StuckReceiptField` (cùng API upload biên lai).
 */
export const manualPayoutFormSchema = z.object({
  bankReference: z
    .string()
    .max(
      MANUAL_PAYOUT_REFERENCE_MAX_LENGTH,
      `Mã tham chiếu tối đa ${MANUAL_PAYOUT_REFERENCE_MAX_LENGTH} ký tự`
    ),
  receipt: receiptSchema.optional(),
  note: z
    .string()
    .max(
      MANUAL_PAYOUT_NOTE_MAX_LENGTH,
      `Lý do tối đa ${MANUAL_PAYOUT_NOTE_MAX_LENGTH} ký tự`
    )
})

export type ManualPayoutFormValues = z.infer<typeof manualPayoutFormSchema>

/** Dữ liệu đã chuẩn hoá gửi lên BE; trường của nhánh thành công vắng khi thất bại. */
export interface ManualPayoutSubmitValues {
  bankReference?: string
  receiptKey?: string
  note: string
}

/**
 * Đủ dữ liệu để gửi chưa. Dùng để khoá nút xác nhận thay vì để người dùng bấm rồi
 * mới báo lỗi: chi thành công thiếu mã tham chiếu hoặc UNC thì BE cũng từ chối.
 */
export const isManualPayoutComplete = (
  outcome: ManualPayoutOutcome,
  // Kiểu lỏng để nhận cả giá trị đang gõ dở từ `useWatch` (DeepPartial).
  values: {
    bankReference?: string
    note?: string
    receipt?: { receiptKey?: string }
  }
): boolean => {
  const note = values.note?.trim() ?? ''
  if (note === '' || note.length > MANUAL_PAYOUT_NOTE_MAX_LENGTH) return false
  if (outcome === ManualPayoutOutcome.FAILED) return true
  const reference = values.bankReference?.trim() ?? ''
  return (
    reference !== '' &&
    reference.length <= MANUAL_PAYOUT_REFERENCE_MAX_LENGTH &&
    Boolean(values.receipt?.receiptKey)
  )
}

/** Cắt khoảng trắng và bỏ trường của nhánh thành công khi chốt thất bại. */
export const toManualPayoutSubmit = (
  outcome: ManualPayoutOutcome,
  values: ManualPayoutFormValues
): ManualPayoutSubmitValues =>
  outcome === ManualPayoutOutcome.SUCCESS
    ? {
        bankReference: values.bankReference.trim(),
        receiptKey: values.receipt?.receiptKey,
        note: values.note.trim()
      }
    : { note: values.note.trim() }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Câu lỗi nghiệp vụ tiếng Việt BE đặt ở `errors[0].message` (hợp đồng chi thủ
 * công 28/10). `null` khi body không có trường này để màn tự rơi về cách đọc cũ
 * (`detail`), tránh hiện câu kỹ thuật tiếng Anh.
 */
export const readFirstErrorMessage = (error: unknown): string | null => {
  if (!isRecord(error) || !isRecord(error.data)) return null
  const errors = error.data.errors
  if (!Array.isArray(errors) || errors.length === 0) return null
  const first: unknown = errors[0]
  if (!isRecord(first)) return null
  const message = first.message
  return typeof message === 'string' && message.trim() !== '' ? message : null
}
