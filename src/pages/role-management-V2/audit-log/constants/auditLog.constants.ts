import type { AuditLogAction } from '../types/auditLog.types'

export const AUDIT_FILTER_KEYS = [
  'actorUsername',
  'actorId',
  'action',
  'entityName',
  'entityId',
  'occurredFrom',
  'occurredTo'
] as const
export type AuditFilterKey = (typeof AUDIT_FILTER_KEYS)[number]

export const AUDIT_DEFAULT_PAGE_SIZE = 20
export const AUDIT_PAGE_SIZE_OPTIONS = ['20', '50', '100']

/** Định dạng BE nhận cho `occurredFrom/To`: ISO ngày-giờ giờ VN, bắt buộc có phần giờ. */
export const AUDIT_API_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss'
export const AUDIT_DISPLAY_TIME_FORMAT = 'DD/MM/YYYY HH:mm:ss'

/** Trần xuất CSV theo SRS; BA chưa xác nhận nên FE chỉ dùng để chặn trước, BE vẫn là nơi quyết định. */
export const AUDIT_EXPORT_LIMIT = 50_000

export const AUDIT_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ActionTone = 'success' | 'danger' | 'warning' | 'info' | undefined

export const AUDIT_ACTION_LABELS: Record<AuditLogAction, string> = {
  INSERT: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  APPROVE: 'Phê duyệt',
  REJECT: 'Từ chối',
  LOCK: 'Khóa',
  UNLOCK: 'Mở khóa',
  TERMINATE: 'Chấm dứt',
  VIEW_DOCUMENT: 'Xem tài liệu',
  RESET_PASSWORD: 'Đặt lại mật khẩu',
  GRANT_PERMISSION: 'Cấp quyền',
  EXPORT: 'Xuất dữ liệu'
}

export const AUDIT_ACTION_TONES: Record<AuditLogAction, ActionTone> = {
  INSERT: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  APPROVE: 'success',
  REJECT: 'danger',
  LOCK: 'warning',
  UNLOCK: 'info',
  TERMINATE: 'danger',
  VIEW_DOCUMENT: undefined,
  RESET_PASSWORD: 'warning',
  GRANT_PERMISSION: 'warning',
  EXPORT: undefined
}

export const AUDIT_ACTION_OPTIONS = (
  Object.keys(AUDIT_ACTION_LABELS) as AuditLogAction[]
).map((value) => ({ value, label: AUDIT_ACTION_LABELS[value] }))

/**
 * Giá trị `entityName` BE hiện ghi (spec §3.16); BE không có API danh mục nên
 * danh sách này tĩnh và ô lọc vẫn cho nhập tay loại mới. `null` = chưa có nhãn.
 */
export const AUDIT_ENTITY_LABELS: Record<string, string | null> = {
  merchants: 'Merchant',
  sub_merchants: 'Sub-merchant',
  terminals: 'Thiết bị thanh toán',
  merchant_assignments: 'Phân công merchant',
  sub_merchant_assignments: 'Phân công sub-merchant',
  MerchantUser: 'Người dùng merchant',
  MerchantUserScopeProposal: 'Đề xuất phạm vi người dùng merchant',
  MerchantPermissionGroup: 'Nhóm quyền merchant',
  EnterpriseWallet: 'Ví doanh nghiệp',
  AdminRolePermission: 'Quyền vai trò quản trị',
  admin_role_sync_state: 'Trạng thái đồng bộ quyền vai trò',
  merchant_notification_configs: 'Cấu hình thông báo merchant',
  merchant_payment_method_configs: 'Cấu hình phương thức thanh toán merchant',
  merchant_bank_accounts: 'Tài khoản ngân hàng merchant',
  MERCHANT_API_CREDENTIAL: 'Khóa API merchant',
  MERCHANT_WEBHOOK: 'Webhook merchant',
  merchant_orders: 'Đơn hàng merchant',
  merchant_settlement_configs: 'Cấu hình đối soát merchant',
  merchant_settlement_defaults: null,
  merchant_limit_config_changes: 'Thay đổi hạn mức merchant',
  merchant_withdrawal_requests: 'Yêu cầu rút tiền merchant',
  merchant_notification_config_exports: 'Xuất cấu hình thông báo merchant',
  sensitive_operations: 'Thao tác nhạy cảm',
  merchant_escrow_payment_blocks: null,
  disbursement_repayments: null,
  company_disbursements: null,
  ewa_company_merchant_bindings: null
}

export const AUDIT_ENTITY_OPTIONS = Object.entries(AUDIT_ENTITY_LABELS).map(
  ([value, label]) => ({ value, label: label ?? value })
)

export const AUDIT_ACTOR_TYPE_LABELS: Record<string, string> = {
  'ewallet-admin': 'Quản trị viên Flexpay',
  'ewallet-merchant': 'Người dùng merchant',
  'ewallet-client': 'Khách hàng',
  SYSTEM: 'Hệ thống',
  UNKNOWN: 'Không xác định'
}

export const EMPTY_AUDIT_FILTERS = {
  actorUsername: '',
  actorId: '',
  entityName: '',
  entityId: ''
}

export const AUDIT_EXPORT_OVER_LIMIT_HINT =
  'Bộ lọc khớp hơn 50.000 bản ghi nên không xuất được một lần. Thu hẹp khoảng thời gian hoặc thêm bộ lọc rồi xuất lại.'
