import type { AdminChangePasswordInput } from '@/app/schemas/change-password'

type ChangePasswordField = keyof AdminChangePasswordInput

interface ApiErrorBody {
  detail?: string
  status?: string
}

export interface ChangePasswordFailure {
  field?: ChangePasswordField
  message: string
}

const ERROR_FIELDS: Partial<Record<string, ChangePasswordField>> = {
  '23010': 'oldPassword',
  '23011': 'confirmPassword',
  '23012': 'newPassword',
  '23014': 'newPassword',
  '20009': 'newPassword',
  '20010': 'newPassword',
  '20011': 'newPassword',
  '20012': 'newPassword',
  '20013': 'newPassword',
  '20014': 'newPassword',
  '20015': 'newPassword',
  '20016': 'newPassword',
  '20017': 'newPassword',
  '20018': 'newPassword'
}

const ERROR_MESSAGES: Record<string, string> = {
  '23010': 'Mật khẩu hiện tại không chính xác',
  '23011': 'Mật khẩu xác nhận không khớp',
  '23012': 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
  '23014': 'Mật khẩu quá dễ đoán. Vui lòng chọn mật khẩu khác.',
  '20009': 'Mật khẩu không đáp ứng yêu cầu bảo mật',
  '20010': 'Mật khẩu mới đã được sử dụng gần đây',
  '20011': 'Mật khẩu chưa đủ độ dài tối thiểu',
  '20012': 'Mật khẩu vượt quá độ dài tối đa',
  '20013': 'Mật khẩu phải có ít nhất 1 chữ hoa',
  '20014': 'Mật khẩu phải có ít nhất 1 chữ thường',
  '20015': 'Mật khẩu phải có ít nhất 1 chữ số',
  '20016': 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt',
  '20017': 'Mật khẩu không được chứa tên đăng nhập',
  '20018': 'Mật khẩu không được chứa email'
}

const readErrorBody = (
  error: object
): ApiErrorBody | null => {
  if (!('data' in error) || !error.data || typeof error.data !== 'object') {
    return null
  }

  const data = error.data
  return {
    detail:
      'detail' in data && typeof data.detail === 'string'
        ? data.detail
        : undefined,
    status:
      'status' in data && typeof data.status === 'string'
        ? data.status
        : undefined
  }
}

export function resolveChangePasswordFailure(
  error: object
): ChangePasswordFailure {
  if (
    'status' in error &&
    (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR')
  ) {
    return {
      message:
        'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'
    }
  }

  const body = readErrorBody(error)
  const code = body?.status
  const detail = body?.detail?.trim()

  return {
    field: code ? ERROR_FIELDS[code] : undefined,
    message:
      detail ||
      (code ? ERROR_MESSAGES[code] : undefined) ||
      'Chưa thể đổi mật khẩu lúc này. Vui lòng thử lại.'
  }
}
