export type WalletLimitErrorKind = 'conflict' | 'fields' | 'message'

export interface ParsedWalletLimitError {
  kind: WalletLimitErrorKind
  /** Câu tiếng Việt hiển thị trên form. */
  message: string
  /** `tên trường → câu lỗi`, trường override có dạng `bankOverrides[0].dailyMaximum`. */
  fields: Record<string, string>
}

const FALLBACK_MESSAGE = 'Có lỗi xảy ra, vui lòng thử lại.'
const VERSION_CONFLICT_CODE = '19110'
const FORM_VALIDATION_DETAIL = 'Validation failed'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readString = (source: Record<string, unknown>, key: string) => {
  const value = source[key]
  return typeof value === 'string' && value ? value : undefined
}

const readFieldErrors = (value: unknown): Record<string, string> => {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  )
}

/**
 * Phân loại lỗi của API hạn mức theo tài liệu BE: 409 `19110` là lệch
 * `rowVersion`; 400 `3001` với detail "Validation failed" mang lỗi từng ô trong
 * `data`; các lỗi khác chỉ có `detail` đã là câu tiếng Việt hiển thị thẳng.
 * Không bao giờ đổ nguyên response ra giao diện.
 */
export const parseWalletLimitError = (
  error: unknown
): ParsedWalletLimitError => {
  const body = isRecord(error) && isRecord(error.data) ? error.data : undefined
  if (!body) return { kind: 'message', message: FALLBACK_MESSAGE, fields: {} }

  const detail = readString(body, 'detail')
  const message = detail ?? readString(body, 'message') ?? FALLBACK_MESSAGE

  if (readString(body, 'status') === VERSION_CONFLICT_CODE) {
    return { kind: 'conflict', message, fields: {} }
  }

  const fields = readFieldErrors(body.data)
  if (detail === FORM_VALIDATION_DETAIL && Object.keys(fields).length > 0) {
    return {
      kind: 'fields',
      message: 'Vui lòng kiểm tra lại các ô được đánh dấu.',
      fields
    }
  }

  return { kind: 'message', message, fields: {} }
}
