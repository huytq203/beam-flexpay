import { STUCK_RECEIPT_MAX_BYTES } from '@type/stuckTransaction.type'

export const RECEIPT_ACCEPT = '.jpeg,.jpg,.png,.webp,.pdf'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
])
const ALLOWED_EXTENSION = /\.(jpe?g|png|webp|pdf)$/i

/** MIME do trình duyệt đoán, có thể trống: khi đó dựa vào đuôi file. BE vẫn nhận diện theo nội dung. */
const hasAllowedType = (file: File): boolean =>
  file.type
    ? ALLOWED_MIME_TYPES.has(file.type.toLowerCase())
    : ALLOWED_EXTENSION.test(file.name)

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** Trả câu lỗi tiếng Việt, hoặc `null` khi file hợp lệ để gửi lên BE. */
export const validateReceiptFile = (file: File): string | null => {
  if (!hasAllowedType(file)) {
    return 'Biên lai chỉ nhận ảnh jpeg, jpg, png, webp hoặc file PDF'
  }
  if (file.size === 0) return 'File biên lai trống'
  if (file.size > STUCK_RECEIPT_MAX_BYTES) {
    return 'Dung lượng biên lai tối đa 2MB'
  }
  return null
}

/** Khoá cache chung để form biết đang upload mà không phải truyền state qua props. */
export const receiptUploadCacheKey = (transactionCode: string): string =>
  `stuck-receipt-upload:${transactionCode}`
