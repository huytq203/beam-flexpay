import { getApiErrorDetail } from '@/app/utils/api-error'

interface ErrorBody {
  message?: unknown
  detail?: unknown
  data?: unknown
}

const readBody = (error: unknown): ErrorBody => {
  if (!error || typeof error !== 'object' || !('data' in error)) return {}
  const { data } = error
  return data && typeof data === 'object' ? (data as ErrorBody) : {}
}

/** Mã lỗi nghiệp vụ: rẽ nhánh theo `message`, không theo câu `detail`. */
export const getAssignmentErrorCode = (error: unknown): string | undefined => {
  const { message } = readBody(error)
  return typeof message === 'string' ? message : undefined
}

const validationDetail = (data: unknown): string => {
  if (!data || typeof data !== 'object') return ''
  return Object.values(data as Record<string, unknown>)
    .filter((item): item is string => typeof item === 'string')
    .join('; ')
}

/**
 * Câu lỗi tiếng Việt theo `message` của BE. 403 gộp hai nguyên nhân (vai trò
 * và phạm vi) nên dùng `detail` của BE để phân biệt; 500 không có nội dung
 * hữu ích nên dùng câu dự phòng.
 */
export const describeAssignmentError = (
  error: unknown,
  fallback: string
): string => {
  const code = getAssignmentErrorCode(error)
  const body = readBody(error)
  switch (code) {
    case 'RESOURCE_NOT_FOUND':
      return 'Không tìm thấy Merchant hoặc Sub-merchant này, có thể đã bị xóa hoặc nằm ngoài phạm vi của bạn.'
    case 'ADMIN_PERMISSION_DENIED':
      return getApiErrorDetail(
        error,
        'Chỉ Super Admin và Admin có phạm vi không giới hạn mới được gán Sales phụ trách.'
      )
    case 'FORBIDDEN':
      return 'Bạn không có quyền thực hiện thao tác này.'
    case 'VALIDATION_ERROR': {
      const fields = validationDetail(body.data)
      return fields || getApiErrorDetail(error, fallback)
    }
    case 'INTERNAL_SERVER_ERROR':
      return fallback
    default:
      return getApiErrorDetail(error, fallback)
  }
}
