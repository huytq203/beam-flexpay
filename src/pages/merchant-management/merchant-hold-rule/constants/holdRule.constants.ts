import type {
  CalculationMode,
  CapBehaviour,
  CapMode,
  HoldPaymentMethod,
  HoldRuleDisplayStatus,
  HoldRuleKey,
  HoldRuleLevel
} from '../types/holdRule.types'

export const MIN_REASON_LENGTH = 10
export const MAX_REASON_LENGTH = 500

export const LEVEL_LABEL: Record<HoldRuleLevel, string> = {
  SYSTEM: 'Mặc định hệ thống',
  MASTER: 'Master merchant',
  SUB: 'Sub-merchant'
}

/** Thứ tự hiển thị đồng thời là danh sách khóa hợp lệ của `config`. */
export const FIELD_LABEL: Record<HoldRuleKey, string> = {
  enabled: 'Bật quy tắc tạm giữ',
  calculationMode: 'Cách tính số tiền giữ',
  ratePercent: 'Tỷ lệ giữ (%)',
  fixedAmount: 'Số tiền giữ cố định (đồng)',
  holdDays: 'Số ngày giữ',
  minimumGrossAmount: 'Gross tối thiểu để bị giữ (đồng)',
  paymentMethods: 'Hình thức thanh toán áp dụng',
  capEnabled: 'Bật trần tích lũy',
  capMode: 'Cách xác định trần',
  capAmount: 'Trần (đồng)',
  capPercent: 'Trần (% doanh thu 30 ngày)',
  capBehaviour: 'Hành vi khi chạm trần'
}

export const FIELD_KEYS = Object.keys(FIELD_LABEL) as HoldRuleKey[]

export const CALCULATION_MODE_LABEL: Record<CalculationMode, string> = {
  PERCENT_OF_GROSS: 'Phần trăm trên số tiền gốc (gross)',
  FIXED_PER_TRANSACTION: 'Số tiền cố định mỗi giao dịch'
}

export const CAP_MODE_LABEL: Record<CapMode, string> = {
  FIXED_AMOUNT: 'Trần là số tiền',
  PERCENT_OF_30_DAY_REVENUE: 'Trần là % doanh thu 30 ngày gần nhất'
}

/** Ý nghĩa `capBehaviour` chưa được BA xác nhận: chỉ hiện đúng giá trị gốc. */
export const CAP_BEHAVIOUR_VALUES: CapBehaviour[] = [
  'STOP_WHEN_FULL',
  'FILL_TO_CAP'
]
export const CAP_BEHAVIOUR_HINT =
  'Ý nghĩa chính xác của giá trị này đang chờ BA/Wallet Core xác nhận nên hệ thống hiển thị đúng giá trị gốc.'

export const PAYMENT_METHOD_LABEL: Record<HoldPaymentMethod, string> = {
  QR: 'QR',
  DOMESTIC_CARD: 'Thẻ nội địa',
  INTERNATIONAL_CARD: 'Thẻ quốc tế',
  LINKED_WALLET: 'Ví liên kết',
  VIRTUAL_ACCOUNT: 'Tài khoản ảo'
}

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

export const CALCULATION_MODE_OPTIONS = toOptions(CALCULATION_MODE_LABEL)
export const CAP_MODE_OPTIONS = toOptions(CAP_MODE_LABEL)
export const PAYMENT_METHOD_OPTIONS = toOptions(PAYMENT_METHOD_LABEL)
export const CAP_BEHAVIOUR_OPTIONS = CAP_BEHAVIOUR_VALUES.map((value) => ({
  value,
  label: value
}))

export const STATUS_LABEL: Record<
  HoldRuleDisplayStatus,
  { label: string; color: 'warning' | 'success' | 'error' | 'default' | 'info' }
> = {
  PENDING: { label: 'Chờ duyệt', color: 'warning' },
  SCHEDULED: { label: 'Chờ hiệu lực', color: 'info' },
  ACTIVE: { label: 'Đang áp dụng', color: 'success' },
  REPLACED: { label: 'Đã thay thế', color: 'default' },
  REJECTED: { label: 'Đã từ chối', color: 'error' }
}

/** Câu tiếng Việt theo `message` (tên mã lỗi) của BE; `detail` là phương án dự phòng. */
export const HOLD_RULE_ERROR_MESSAGE: Record<string, string> = {
  ADMIN_PERMISSION_DENIED:
    'Bạn không có quyền thực hiện thao tác này hoặc đối tượng nằm ngoài phạm vi được gán',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  EXTERNAL_API_ERROR:
    'Không kết nối được dịch vụ liên kết, vui lòng thử lại sau',
  INTERNAL_SERVER_ERROR: 'Lỗi hệ thống, vui lòng thử lại sau'
}
