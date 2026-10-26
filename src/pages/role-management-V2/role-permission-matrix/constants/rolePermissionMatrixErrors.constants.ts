/** Tên mã lỗi (`message` của BE) sang câu tiếng Việt hiển thị; rẽ nhánh theo `message`, không theo `status`. */
export const MATRIX_ERROR_MESSAGE: Record<string, string> = {
  ADMIN_ROLE_PERMISSION_DUPLICATE_FUNCTION:
    'Một chức năng chỉ được khai báo một lần trong danh sách quyền',
  ADMIN_ROLE_PERMISSION_SUPER_ADMIN_PROTECTED:
    'Chỉ Super Admin mới được sửa quyền của vai trò Super Admin',
  ADMIN_SYNC_WOULD_LOCK_OUT_ACTOR:
    'Đồng bộ này sẽ gỡ quyền quản trị ma trận của chính bạn',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  VALIDATION_ERROR: 'Dữ liệu yêu cầu không hợp lệ',
  BAD_REQUEST: 'Dữ liệu gửi lên không hợp lệ, vui lòng tải lại màn hình',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  INVALID_TOKEN: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại',
  INTERNAL_SERVER_ERROR: 'Hệ thống đang gặp lỗi, vui lòng thử lại sau',
  EXTERNAL_API_ERROR:
    'Không kết nối được dịch vụ liên kết, vui lòng thử lại sau'
}

/** Các lỗi nghiệp vụ có `detail` cụ thể (ví dụ tên chức năng bị trùng) nên ưu tiên hiển thị `detail`. */
export const MATRIX_DETAIL_PREFERRED = new Set([
  'ADMIN_ROLE_PERMISSION_DUPLICATE_FUNCTION',
  'ADMIN_ROLE_PERMISSION_SUPER_ADMIN_PROTECTED',
  'ADMIN_SYNC_WOULD_LOCK_OUT_ACTOR'
])
