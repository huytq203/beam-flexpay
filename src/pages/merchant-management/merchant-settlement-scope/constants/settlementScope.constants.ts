import { MODE_OPTIONS } from '../../merchant-settlement/constants/settlementConfig.constants'
import type {
  ConfigListSource,
  HistoryLevel,
  ScopeSource
} from '../types/settlementScope.types'

export const SCOPE_SOURCE_LABEL: Record<ScopeSource, string> = {
  SYSTEM: 'Mặc định hệ thống',
  MASTER: 'Master',
  SUB: 'Sub-merchant',
  SUSPENDED_SUB: 'Sub-merchant đang tạm tắt',
  SUSPENDED_MASTER: 'Master đang tạm tắt'
}

export const LEVEL_LABEL: Record<HistoryLevel, string> = {
  SYSTEM: 'Mặc định hệ thống',
  MASTER: 'Master',
  SUB: 'Sub-merchant'
}

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABEL).map(
  ([value, label]) => ({ value, label })
)

/** Mặc định hệ thống không đặt được `HOLD`; chỉ gửi giá trị canonical, không gửi alias AUTO_T*. */
export const SYSTEM_MODE_OPTIONS = MODE_OPTIONS.filter(
  (option) => option.value !== 'HOLD'
)

export const MIN_REASON_LENGTH = 10

export const CONFIG_SOURCE_LABEL: Record<ConfigListSource, string> = {
  OWN: 'Cấu hình riêng',
  INHERITED: 'Kế thừa',
  SYSTEM_DEFAULT: 'Mặc định hệ thống'
}

export const CONFIG_SOURCE_OPTIONS = Object.entries(CONFIG_SOURCE_LABEL).map(
  ([value, label]) => ({ value, label })
)

export const CONFIG_SEARCH_MAX = 100

export const SCOPE_TAB_KEYS = {
  master: 'master',
  system: 'system',
  history: 'history',
  at: 'at'
} as const

export const FIELD_LABEL = {
  settlementMode: 'Chế độ',
  autoFrequency: 'Tần suất',
  holdbackDays: 'T+N (ngày chờ)',
  holdReason: 'Lý do tạm dừng',
  active: 'Đang áp dụng'
} as const

/** Câu tiếng Việt theo `message` (tên mã lỗi) của BE; `detail` chỉ là phương án dự phòng. */
export const SCOPE_ERROR_MESSAGE: Record<string, string> = {
  MERCHANT_SETTLEMENT_HOLDBACK_OUT_OF_RANGE:
    'Số ngày chờ phải là số nguyên từ 0 đến 365',
  MERCHANT_SETTLEMENT_HOLD_REASON_REQUIRED:
    'Tạm dừng quyết toán phải nhập lý do tối thiểu 10 ký tự',
  MERCHANT_SETTLEMENT_LOOSENING_NEEDS_APPROVER:
    'Rút ngắn T+N hoặc chuyển sang quyết toán tự động ở cấp này cần quyền phê duyệt cấu hình quyết toán',
  RESOURCE_NOT_FOUND: 'Không tìm thấy Merchant hoặc Sub-merchant',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  EXTERNAL_API_ERROR:
    'Không kết nối được dịch vụ liên kết, vui lòng thử lại sau',
  INTERNAL_SERVER_ERROR: 'Lỗi hệ thống, vui lòng thử lại sau'
}
