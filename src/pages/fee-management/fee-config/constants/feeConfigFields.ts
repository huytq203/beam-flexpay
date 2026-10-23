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

/**
 * Nạp, rút ví và hoàn tiền (hoàn một lệnh nạp/rút đã đi qua NCC) có NCC; khớp `ProviderScope`
 * ở dịch vụ phí.
 */
const PROVIDER_SERVICE_TYPES: readonly string[] = [
  'EWALLET_DEPOSIT',
  'EWALLET_WITHDRAWAL',
  'EWALLET_REFUND'
]

/** Chuyển ví sang ví không đi qua ngân hàng nên không có tiêu chí ngân hàng. */
export const allowsBankCriteria = (
  serviceType: string | null | undefined
): boolean => serviceType !== 'EWALLET_TRANSFER_INTERNAL'

export const allowsProviderCriteria = (
  serviceType: string | null | undefined
): boolean => !!serviceType && PROVIDER_SERVICE_TYPES.includes(serviceType)

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
      showMerchant: true,
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
 * Miền phí suy ra từ loại giao dịch: thu hộ và chi hộ thuộc ĐVCNTT, còn lại thuộc
 * ví. Backend chỉ coi miền là nhãn phân loại, nên người vận hành không phải chọn.
 */
export const getFeeDomainForServiceType = (
  serviceType: string | null | undefined
): FeeDomain =>
  allowsMerchantCriteria(serviceType) ? FeeDomain.MERCHANT : FeeDomain.EWALLET

/**
 * Các ô gán đối tượng hiện ra theo LOẠI GIAO DỊCH, không theo miền phí: thu hộ và
 * chi hộ nhận Merchant (kèm Ngân hàng để cấu hình ưu đãi riêng cho một cặp), còn
 * nạp, rút, chuyển nội bộ nhận ví riêng hoặc nhóm khách. Ngân hàng luôn tuỳ chọn.
 *
 * Chính sách Bank/NCC cũ (miền BANK) giữ luật cũ: bắt buộc đúng một ngân hàng.
 */
export const getFormFieldRules = (
  domain: FeeDomain,
  serviceType: string | null | undefined
): DomainFieldRules => {
  if (domain === FeeDomain.BANK) return DOMAIN_FIELD_RULES[FeeDomain.BANK]
  const merchantFlow = allowsMerchantCriteria(serviceType)
  return {
    bankRequired: false,
    showMerchant: merchantFlow,
    showSubject: !merchantFlow,
    showSegment: !merchantFlow,
    serviceTypes: PUBLISHABLE_SERVICE_TYPES
  }
}

/**
 * Nhóm nghiệp vụ chỉ dùng để dẫn dắt form; backend không có và không nhận
 * trường này. Nó giới hạn enum componentType rộng của backend xuống đúng ba
 * sản phẩm phí BA đang vận hành.
 */
export const FEE_BUSINESS_CATEGORY = {
  BANK_PROVIDER: 'BANK_PROVIDER',
  TRANSACTION_PROCESSING: 'TRANSACTION_PROCESSING',
  PLATFORM: 'PLATFORM'
} as const

export type FeeBusinessCategory =
  (typeof FEE_BUSINESS_CATEGORY)[keyof typeof FEE_BUSINESS_CATEGORY]

interface FeeBusinessCategoryRule {
  readonly label: string
  readonly componentTypes: readonly string[]
  readonly vatBaseComponentType: string | null
}

export const FEE_BUSINESS_CATEGORY_RULES: Readonly<
  Record<FeeBusinessCategory, FeeBusinessCategoryRule>
> = {
  [FEE_BUSINESS_CATEGORY.BANK_PROVIDER]: {
    label: 'Phí Bank/NCC',
    componentTypes: ['BANK_FEE', 'VAT'],
    vatBaseComponentType: 'BANK_FEE'
  },
  [FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING]: {
    label: 'Phí xử lý giao dịch',
    componentTypes: ['TRANSACTION_FEE', 'VAT'],
    vatBaseComponentType: 'TRANSACTION_FEE'
  },
  [FEE_BUSINESS_CATEGORY.PLATFORM]: {
    label: 'Phí nền tảng',
    componentTypes: ['PLATFORM_FEE', 'VAT'],
    vatBaseComponentType: 'PLATFORM_FEE'
  }
}

/**
 * Luồng phí của một thành phần: phí đầu ra (đầu ra) hay phí đầu vào
 * (đầu vào). Backend lưu cột `fee_scope` và ép khớp người chịu: chi phí đầu vào
 * luôn do Hệ thống chịu, phí đầu ra không bao giờ do Hệ thống chịu.
 */
export const FEE_SCOPE = {
  OUTPUT_FEE: 'OUTPUT_FEE',
  INPUT_COST: 'INPUT_COST'
} as const

export type FeeScope = (typeof FEE_SCOPE)[keyof typeof FEE_SCOPE]

export const FEE_SCOPE_LABEL: Readonly<Record<FeeScope, string>> = {
  OUTPUT_FEE: 'Phí đầu ra',
  INPUT_COST: 'Phí đầu vào'
}

export const FEE_SCOPES: readonly FeeScope[] = [
  FEE_SCOPE.OUTPUT_FEE,
  FEE_SCOPE.INPUT_COST
]

/**
 * Loại chính sách (cột `policy_kind`, bất biến sau khi tạo). Chính sách phí khách chỉ chứa
 * thành phần phí đầu ra; chính sách phí đầu vào chỉ chứa chi phí trả đối tác.
 */
export const POLICY_KIND = {
  CUSTOMER_FEE: 'CUSTOMER_FEE',
  INPUT_COST: 'INPUT_COST'
} as const

export type PolicyKind = (typeof POLICY_KIND)[keyof typeof POLICY_KIND]

/** Tab Phí đầu ra xem chính sách phí khách, tab Phí đầu vào xem chính sách chi phí đầu vào. */
export const policyKindOfScope = (scope: FeeScope): PolicyKind =>
  scope === FEE_SCOPE.INPUT_COST
    ? POLICY_KIND.INPUT_COST
    : POLICY_KIND.CUSTOMER_FEE

export const feeScopeTabId = (scope: FeeScope) => `fee-scope-tab-${scope}`
export const feeScopePanelId = (scope: FeeScope) => `fee-scope-panel-${scope}`

export const getFeeScopeOfPayer = (payerType: string): FeeScope =>
  payerType === 'SYSTEM' ? FEE_SCOPE.INPUT_COST : FEE_SCOPE.OUTPUT_FEE

/** Bản ghi cũ chưa có `feeScope` thì suy từ người chịu phí, đúng luật backend cũ. */
export const resolveFeeScope = (
  feeScope: string | null | undefined,
  payerType: string
): FeeScope =>
  feeScope === FEE_SCOPE.INPUT_COST || feeScope === FEE_SCOPE.OUTPUT_FEE
    ? feeScope
    : getFeeScopeOfPayer(payerType)

export const getFeeBusinessCategories = (
  scope: FeeScope
): readonly FeeBusinessCategory[] =>
  scope === FEE_SCOPE.INPUT_COST
    ? [FEE_BUSINESS_CATEGORY.BANK_PROVIDER]
    : [
        FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING,
        FEE_BUSINESS_CATEGORY.PLATFORM
      ]

/** Hoàn tiền thu bằng phí riêng `REFUND_FEE`; không dùng "Phí giao dịch cơ bản". */
const REFUND_COMPONENT_TYPE = 'REFUND_FEE'

const isRefundProcessing = (
  category: FeeBusinessCategory,
  serviceType?: string | null
): boolean =>
  serviceType === 'EWALLET_REFUND' &&
  category === FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING

/**
 * Chính sách hoàn tiền chỉ có Phí hoàn tiền và VAT của nó, không còn Phí giao dịch cơ bản.
 */
export const getComponentTypesForCategory = (
  category: FeeBusinessCategory,
  serviceType?: string | null
): readonly string[] =>
  isRefundProcessing(category, serviceType)
    ? [REFUND_COMPONENT_TYPE, 'VAT']
    : FEE_BUSINESS_CATEGORY_RULES[category].componentTypes

/** VAT tính trên khoản phí gốc của nhóm; với hoàn tiền khoản đó là Phí hoàn tiền. */
export const getVatBaseForCategory = (
  category: FeeBusinessCategory,
  serviceType?: string | null
): string | null =>
  isRefundProcessing(category, serviceType)
    ? REFUND_COMPONENT_TYPE
    : FEE_BUSINESS_CATEGORY_RULES[category].vatBaseComponentType

/** Suy nhóm khi mở bản ghi cũ mà không cần thêm field vào API backend. */
export const inferFeeBusinessCategory = (
  scope: FeeScope,
  components: readonly { componentType: string }[]
): FeeBusinessCategory => {
  if (scope === FEE_SCOPE.INPUT_COST) return FEE_BUSINESS_CATEGORY.BANK_PROVIDER
  if (
    components.some(({ componentType }) => componentType === 'PLATFORM_FEE')
  ) {
    return FEE_BUSINESS_CATEGORY.PLATFORM
  }
  return FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING
}

export {
  FEE_PRIORITY_OPTIONS,
  DEFAULT_PRIORITY,
  ASSIGNMENT_SCOPE,
  ASSIGNMENT_SCOPE_OPTIONS,
  type AssignmentScope
} from './feeAssignment'

export {
  BACKEND_PAYMENT_METHODS,
  PAYMENT_METHOD_OPTIONS_BY_SERVICE_TYPE,
  getPaymentMethodOptions,
  isPaymentMethodAllowed,
  type BackendPaymentMethod,
  type PaymentMethodOption
} from './feePaymentMethods'

export {
  PAYER_TYPE_LABEL,
  getPayerLabel,
  getPayerTypeOptions,
  getOutputPayerOptions,
  BENEFICIARY_TYPE_LABEL,
  BENEFICIARY_TYPE_OPTIONS,
  INPUT_COST_BENEFICIARY_OPTIONS
} from './feeComponentParties'

/**
 * Thuế giá trị gia tăng luôn tính trên khoản phí gốc của nhóm (phí Bank/NCC
 * hoặc phí giao dịch), không tính trực tiếp trên số tiền và chỉ nhập phần trăm.
 */
export const VAT_COMPONENT_TYPE = 'VAT'

/**
 * Loại chủ thể gửi kèm khi bản gán chỉ định đúng một ví.
 *
 * Dịch vụ phí chặn ở bước duyệt nếu loại này không khớp luồng, nên chỉ miền Ví
 * mới gửi — luồng thu hộ và chi hộ dùng ô ĐVCNTT.
 */
export const WALLET_SUBJECT_TYPE = 'USER'
