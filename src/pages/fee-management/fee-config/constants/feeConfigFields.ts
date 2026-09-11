import { FeeDomain } from '@components/fee/feeDomain'
import {
  PUBLISHABLE_SERVICE_TYPES,
  allowsMerchantCriteria
} from '@utils/fee-execution'

/**
 * Miền phí quyết định màn hiện những trường nào. Ma trận nằm gọn ở đây để form
 * và schema đọc chung một nguồn — trường bị ẩn mà schema vẫn bắt nhập là kiểu
 * lỗi người dùng không bao giờ tự gỡ được, vì họ không thấy ô nào để điền.
 */
/**
 * Không có tiêu chí nào trỏ tới một ví hay một người dùng cụ thể: bảng bản ghi
 * gán của dịch vụ phí không có cột nào cho việc đó. Mức nhỏ nhất áp được là một
 * ĐVCNTT, và chỉ với luồng thu hộ / chi hộ.
 */
export interface DomainFieldRules {
  /** Ô ngân hàng: bắt buộc với miền Bank, tuỳ chọn với hai miền còn lại. */
  readonly bankRequired: boolean
  readonly showMerchant: boolean
  readonly serviceTypes: readonly string[]
}

const WALLET_SERVICE_TYPES = PUBLISHABLE_SERVICE_TYPES.filter(
  (serviceType) => !allowsMerchantCriteria(serviceType)
)

const MERCHANT_SERVICE_TYPES = PUBLISHABLE_SERVICE_TYPES.filter(
  allowsMerchantCriteria
)

/**
 * Miền Bank ghi biểu phí phía ngân hàng nên nhận mọi luồng có chạm ngân hàng,
 * cả luồng ví lẫn luồng thu chi hộ. Chuyển tiền nội bộ không qua ngân hàng nên
 * bị loại.
 */
const BANK_SERVICE_TYPES = PUBLISHABLE_SERVICE_TYPES.filter(
  (serviceType) => serviceType !== 'EWALLET_TRANSFER_INTERNAL'
)

export const DOMAIN_FIELD_RULES: Readonly<Record<FeeDomain, DomainFieldRules>> =
  {
    [FeeDomain.BANK]: {
      bankRequired: true,
      showMerchant: false,
      serviceTypes: BANK_SERVICE_TYPES
    },
    [FeeDomain.EWALLET]: {
      bankRequired: false,
      showMerchant: false,
      serviceTypes: WALLET_SERVICE_TYPES
    },
    [FeeDomain.MERCHANT]: {
      bankRequired: false,
      showMerchant: true,
      serviceTypes: MERCHANT_SERVICE_TYPES
    }
  }

export const getDomainFieldRules = (domain: FeeDomain): DomainFieldRules =>
  DOMAIN_FIELD_RULES[domain]

/**
 * Số nhỏ thắng khi hai chính sách cùng phủ một giao dịch. `FeePolicyCreateRequest`
 * mặc định 1000 nếu không gửi, nên form luôn phải điền tường minh.
 */
export const FEE_PRIORITY_OPTIONS = [
  { value: 1, label: 'Cao — thắng trước mọi mức khác' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Thấp' },
  { value: 4, label: 'Mặc định — chỉ dùng khi không có mức nào khác' }
] as const

export const DEFAULT_PRIORITY = 4

/** Phương thức giao dịch trùng với bảng nhãn dùng chung của module phí. */
export const PAYMENT_METHOD_VALUES = [
  'ATM',
  'CREDIT_CARD',
  'QR_CODE',
  'BANK_TRANSFER',
  'LINKED_ACCOUNT',
  'WALLET_BALANCE',
  'VA'
] as const

/**
 * Người chịu phí. Danh sách đủ theo enum `PayerType` của backend.
 *
 * Lưu được cả năm giá trị, nhưng `FeeExecutionCapabilityRegistry` lúc DUYỆT chỉ
 * chấp nhận đúng giá trị mà loại giao dịch thực thi được. Form vì vậy mở danh
 * sách nhưng cảnh báo ngay khi lệch, thay vì để người dùng biết ở bước duyệt.
 */
export const PAYER_TYPE_OPTIONS = [
  { value: 'USER', label: 'Người dùng' },
  { value: 'MERCHANT', label: 'Merchant' },
  { value: 'SYSTEM', label: 'Hệ thống/platform' },
  { value: 'SENDER', label: 'Người gửi' },
  { value: 'RECEIVER', label: 'Người nhận' }
] as const

export const PAYER_TYPE_LABEL: Readonly<Record<string, string>> =
  Object.fromEntries(PAYER_TYPE_OPTIONS.map((o) => [o.value, o.label]))

/**
 * Thuế giá trị gia tăng luôn tính trên phí giao dịch, không tính trên số tiền
 * giao dịch, và chỉ nhập phần trăm.
 */
export const VAT_COMPONENT_TYPE = 'VAT'
export const VAT_BASE_COMPONENT_TYPE = 'TRANSACTION_FEE'
