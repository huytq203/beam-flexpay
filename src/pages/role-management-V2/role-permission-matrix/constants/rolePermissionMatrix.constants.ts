import type {
  AdminAccessScope,
  AdminAccessType,
  AdminRole,
  AdminSyncState
} from '../types/rolePermissionMatrix.types'

/** Dòng ma trận cho phép vai trò quản trị chính ma trận (`ROLE_PERMISSION:MANAGE`). */
export const MANAGE_MATRIX_FUNCTION = 'ROLE_PERMISSION_MANAGE'

export const REASON_MAX_LENGTH = 255

export const ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  SALES: 'Kinh doanh',
  ACCOUNTANT: 'Kế toán',
  RISK_MANAGER: 'Quản lý rủi ro',
  OPS_SUPPORT: 'Hỗ trợ vận hành'
}

export const ADMIN_ROLES = Object.keys(ROLE_LABEL) as AdminRole[]

/** Thứ tự đúng bảng chú giải SRS §2.4. */
export const ACCESS_TYPES: AdminAccessType[] = [
  'READ',
  'CREATE',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'EXPORT'
]

export const ACCESS_TYPE_SYMBOL: Record<AdminAccessType, string> = {
  READ: 'R',
  CREATE: 'C',
  UPDATE: 'U',
  DELETE: 'D',
  APPROVE: 'A',
  EXPORT: 'E'
}

export const ACCESS_TYPE_LABEL: Record<AdminAccessType, string> = {
  READ: 'Xem',
  CREATE: 'Tạo mới',
  UPDATE: 'Sửa',
  DELETE: 'Xóa/Khóa',
  APPROVE: 'Phê duyệt',
  EXPORT: 'Xuất file'
}

export const SCOPE_LABEL: Record<AdminAccessScope, string> = {
  ALL: 'Mọi merchant',
  ASSIGNED: 'Chỉ merchant được gán'
}

export const SYNC_STATE_LABEL: Record<AdminSyncState, string> = {
  NEVER_SYNCED: 'Chưa từng đồng bộ',
  IN_SYNC: 'Đã đồng bộ',
  OUT_OF_SYNC: 'Lệch so với lần đồng bộ cuối'
}

export const SYNC_STATE_TONE: Record<
  AdminSyncState,
  'success' | 'warning' | 'danger' | 'info' | 'normal'
> = {
  NEVER_SYNCED: 'normal',
  IN_SYNC: 'success',
  OUT_OF_SYNC: 'warning'
}

/** Ghi chú cố định của màn: BE chưa có publisher Keycloak thật (câu hỏi K4). */
export const SYNC_NOT_EFFECTIVE_NOTICE =
  'Lưu ma trận chỉ ghi vào hệ thống. Cổng phân quyền của từng API chỉ đổi sau khi đồng bộ lên Keycloak và người dùng lấy token mới. Theo BE hiện tại, đồng bộ Keycloak chưa thực sự đẩy quyền (BE chỉ tính kế hoạch), nên trạng thái có thể không bao giờ chuyển sang "Đã đồng bộ". Chỉ trạng thái "Đã đồng bộ" mới xác nhận quyền đã khớp.'

/** Nhóm hiển thị là cách trình bày của FE; BE không trả trường nhóm. */
export const GROUP_OTHER = { key: 'other', label: 'Khác' } as const

export const FUNCTION_GROUPS: ReadonlyArray<{
  key: string
  label: string
  match: (code: string) => boolean
}> = [
  {
    key: 'merchant-user',
    label: 'User Merchant và nhóm quyền',
    match: (code) =>
      code.startsWith('MERCHANT_USER_') ||
      code === 'PERMISSION_GROUP_MANAGE' ||
      code === 'SYSTEM_GROUP_MANAGE'
  },
  {
    key: 'merchant',
    label: 'Merchant',
    match: (code) => code.startsWith('MERCHANT_')
  },
  {
    key: 'sub-merchant',
    label: 'Sub-merchant',
    match: (code) =>
      code.startsWith('SUB_MERCHANT_') ||
      ['API_KEY_REGENERATE', 'IP_WHITELIST_UPDATE'].includes(code)
  },
  {
    key: 'terminal',
    label: 'Terminal',
    match: (code) => code.startsWith('TERMINAL_')
  },
  {
    key: 'wallet',
    label: 'Ví doanh nghiệp và chi hộ',
    match: (code) =>
      code.startsWith('ENTERPRISE_WALLET_') ||
      code.startsWith('DISBURSEMENT_') ||
      code === 'INTERNAL_WALLET_FLAG_UPDATE'
  },
  {
    key: 'bank',
    label: 'Tài khoản ngân hàng',
    match: (code) => code.startsWith('BANK_ACCOUNT_')
  },
  {
    key: 'fee',
    label: 'Phí',
    match: (code) => code.startsWith('FEE_CONFIG_')
  },
  {
    key: 'settlement',
    label: 'Quyết toán và đối soát',
    match: (code) =>
      code.startsWith('SETTLEMENT_') ||
      ['BALANCE_REPORT_VIEW', 'RECONCILIATION_RUN'].includes(code)
  },
  {
    key: 'escrow',
    label: 'Ký quỹ',
    match: (code) => code.startsWith('ESCROW_')
  },
  {
    key: 'hold',
    label: 'Tạm giữ',
    match: (code) => code.startsWith('HOLD_')
  },
  {
    key: 'config',
    label: 'Cấu hình theo cấp',
    match: (code) =>
      ['PAYMENT_METHOD_CONFIG_UPDATE', 'NOTIFICATION_CONFIG_UPDATE'].includes(
        code
      )
  },
  {
    key: 'system',
    label: 'Quản trị hệ thống',
    match: (code) =>
      [
        'SALES_ASSIGNMENT_MANAGE',
        'ROLE_PERMISSION_MANAGE',
        'AUDIT_LOG_EXPORT',
        'DOCUMENT_UPLOAD'
      ].includes(code)
  }
]
