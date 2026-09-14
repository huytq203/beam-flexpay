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
export interface DomainFieldRules {
  /** Ô ngân hàng: bắt buộc với miền Bank, tuỳ chọn với hai miền còn lại. */
  readonly bankRequired: boolean
  readonly showMerchant: boolean
  /**
   * Ô gán riêng cho một ví. Chỉ có nghĩa ở miền Ví: luồng thu hộ và chi hộ nhận
   * chủ thể là ĐVCNTT, và ô đó đã có riêng.
   */
  readonly showSubject: boolean
  /**
   * Ô phân khúc khách hàng. Đi cùng ô chủ thể vì phân khúc là thuộc tính của chủ ví;
   * khớp lệnh xếp chủ thể trên phân khúc, phân khúc trên mọi tiêu chí kênh.
   */
  readonly showSegment: boolean
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
      showSubject: false,
      showSegment: false,
      serviceTypes: BANK_SERVICE_TYPES
    },
    [FeeDomain.EWALLET]: {
      bankRequired: false,
      showMerchant: false,
      showSubject: true,
      showSegment: true,
      serviceTypes: WALLET_SERVICE_TYPES
    },
    [FeeDomain.MERCHANT]: {
      bankRequired: false,
      showMerchant: true,
      showSubject: false,
      showSegment: false,
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
  { value: 1, label: 'Cao' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Thấp' },
  { value: 4, label: 'Mặc định' }
] as const

export const DEFAULT_PRIORITY = 4

/**
 * Đối tượng áp dụng của bản gán.
 *
 * Ba mức loại trừ nhau nên gộp vào một ô chọn thay vì để hai ô rời: người vận hành điền cả
 * phân khúc lẫn một ví cụ thể sẽ tạo ra bản gán hẹp hơn ý họ mà không có gì báo.
 *
 * Thứ tự khớp lệnh ở backend: cá nhân thắng nhóm, nhóm thắng mọi tiêu chí kênh.
 */
export const ASSIGNMENT_SCOPE = {
  ALL: 'ALL',
  SEGMENT: 'SEGMENT',
  SUBJECT: 'SUBJECT'
} as const

export type AssignmentScope =
  (typeof ASSIGNMENT_SCOPE)[keyof typeof ASSIGNMENT_SCOPE]

export const ASSIGNMENT_SCOPE_OPTIONS = [
  { value: ASSIGNMENT_SCOPE.ALL, label: 'Tất cả khách hàng' },
  { value: ASSIGNMENT_SCOPE.SEGMENT, label: 'Nhóm khách hàng' },
  { value: ASSIGNMENT_SCOPE.SUBJECT, label: 'Cá nhân' }
] as const

/** Các mã paymentMethod backend phí thực sự hỗ trợ. */
export const BACKEND_PAYMENT_METHODS = [
  'LINKED_ACCOUNT',
  'WALLET_BALANCE',
  'BANK_TRANSFER',
  'ATM',
  'CC',
  'VA'
] as const

export type BackendPaymentMethod = (typeof BACKEND_PAYMENT_METHODS)[number]

export interface PaymentMethodOption {
  readonly value: BackendPaymentMethod
  readonly label: string
}

/**
 * Phương thức được phép chọn theo loại giao dịch.
 *
 * Nhãn có chủ đích phụ thuộc ngữ cảnh: cùng mã `ATM` nhưng ở luồng rút là
 * IBFT về thẻ, còn ở thanh toán/hoàn tiền bao gồm ngân hàng liên kết và trực
 * tiếp. Backend nhận mã ở `value`; phần diễn giải chỉ phục vụ người vận hành.
 * QR chưa thuộc enum backend phí nên không được đưa vào danh sách lựa chọn.
 */
export const PAYMENT_METHOD_OPTIONS_BY_SERVICE_TYPE: Readonly<
  Record<string, readonly PaymentMethodOption[]>
> = {
  EWALLET_DEPOSIT: [
    { value: 'ATM', label: 'Thẻ ATM' },
    {
      value: 'LINKED_ACCOUNT',
      label: 'Tài khoản ngân hàng liên kết (IB)'
    }
  ],
  EWALLET_WITHDRAWAL: [
    { value: 'ATM', label: 'Thẻ ATM (IBFT về thẻ ATM)' },
    {
      value: 'BANK_TRANSFER',
      label: 'Tài khoản ngân hàng (IBFT về tài khoản ngân hàng)'
    }
  ],
  EWALLET_TRANSFER_INTERNAL: [
    { value: 'WALLET_BALANCE', label: 'Ví điện tử' }
  ],
  EWALLET_TRANSFER_EXTERNAL: [
    { value: 'BANK_TRANSFER', label: 'Tài khoản ngân hàng (IBFT)' }
  ],
  EWALLET_CASHBACK: [
    { value: 'WALLET_BALANCE', label: 'Số dư ví' },
    {
      value: 'ATM',
      label: 'Thẻ ATM (ngân hàng liên kết và trực tiếp)'
    },
    {
      value: 'LINKED_ACCOUNT',
      label: 'Tài khoản ngân hàng liên kết'
    },
    {
      value: 'BANK_TRANSFER',
      label: 'Chuyển khoản ngân hàng trực tiếp'
    },
    { value: 'CC', label: 'Thẻ tín dụng/quốc tế' }
  ],
  MERCHANT_VA_BILL_COLLECTION: [
    { value: 'VA', label: 'Tài khoản định danh (VA)' }
  ],
  PAYOUT_BANK_TRANSFER: [
    { value: 'BANK_TRANSFER', label: 'Tài khoản ngân hàng' }
  ]
}

export const getPaymentMethodOptions = (
  serviceType: string | null | undefined
): readonly PaymentMethodOption[] =>
  (serviceType && PAYMENT_METHOD_OPTIONS_BY_SERVICE_TYPE[serviceType]) || []

export const isPaymentMethodAllowed = (
  serviceType: string | null | undefined,
  paymentMethod: string
): boolean =>
  getPaymentMethodOptions(serviceType).some(
    (option) => option.value === paymentMethod
  )

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

/**
 * Loại chủ thể gửi kèm khi bản gán chỉ định đúng một ví.
 *
 * Dịch vụ phí chặn ở bước duyệt nếu loại này không khớp luồng, nên chỉ miền Ví
 * mới gửi — luồng thu hộ và chi hộ dùng ô ĐVCNTT.
 */
export const WALLET_SUBJECT_TYPE = 'USER'
