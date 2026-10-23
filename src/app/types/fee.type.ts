/**
 * Kiểu dữ liệu module phí, khớp response của service `flexpay.fee`.
 *
 * Đặt ở tầng app vì ba nơi cùng đọc: tầng service, màn cấu hình phí và tab cấu
 * hình phí trong chi tiết ví. Trước đây chúng nằm trong thư mục của một màn cụ
 * thể, nên xoá màn là gãy tầng service.
 */

import type { FeeEffectiveStatus } from '@/app/schemas/applicable-fee-rule.schema'

export interface AppliedSubject {
  subjectType: 'USER' | 'MERCHANT'
  subjectId: string
  fullName: string | null
  displayName: string | null
}

export interface AppliedTarget {
  type: 'ALL' | 'CUSTOMER_GROUP' | 'ACCOUNT'
  code: string | null
  count: number
  /** Tổng chủ thể thật; BE cũ có thể chưa trả. */
  subjectCount?: number
  /** Tối đa 5 chủ thể để xem nhanh; BE cũ có thể chưa trả. */
  subjects?: AppliedSubject[]
}

/** Loại chính sách phí, bất biến sau khi tạo. */
export type FeePolicyKind = 'CUSTOMER_FEE' | 'INPUT_COST'

export interface FeePolicy {
  id: string
  /** Mã đối soát dễ đọc do BE sinh, ví dụ FF26BH44R; BE cũ có thể chưa trả. */
  feeCode?: string | null
  /** Optimistic lock của BE — bắt buộc khi gọi API duyệt. */
  lockVersion?: number
  /** Mã băm nội dung bản ghi tại thời điểm checker xem — bắt buộc khi duyệt. */
  reviewHash?: string
  name: string
  serviceType: string
  feeDomain: string
  /** BE cũ có thể chưa trả; vắng = CUSTOMER_FEE. */
  policyKind?: FeePolicyKind
  currency: string
  description?: string
  validFrom: string
  validTo: string | null
  status: string
  /** Chờ áp dụng / Hết hạn; BE chỉ trả khi status = ACTIVE. */
  effectiveStatus?: FeeEffectiveStatus | null
  priority: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  /** Tổng hợp đối tượng đang được gán; API cũ có thể chưa trả trường này. */
  appliedTargets?: AppliedTarget[]
  configuration?: FeePolicyConfiguration
}

export interface FeePolicyComponent {
  id: string
  feePolicyId: string
  /** API cũ chưa trả trường này; khi vắng thì suy từ người chịu phí. */
  feeScope?: string
  componentType: string
  baseOn: string
  baseComponentType: string | null
  calculationMethod: string
  fixedAmount: number
  percentage: number
  roundMode: string
  minFee: number
  maxFee: number
  payerType: string
  payerObjectType: string | null
  payerObjectId: string | null
  beneficiaryType: string
  beneficiaryObjectType: string | null
  beneficiaryObjectId: string | null
  createdAt?: string
  updatedAt?: string
}

export interface FeeComponentTier {
  id: string
  feeComponentId: string
  minValue: number
  maxValue: number | null
  roundMode: string
  minFee: number
  maxFee: number
  fixedAmount: number
  percentage: number
}

export interface FeeAssignment {
  id: string
  lockVersion?: number
  reviewHash?: string
  feePolicyId: string
  merchantId: string | null
  bankCode: string | null
  /** NCC (cổng trung gian như NAPAS). NULL = mọi NCC. */
  providerCode?: string | null
  /** Loại giao dịch gốc của hoàn tiền. NULL = mọi loại hoàn. */
  originalTransactionType?: string | null
  paymentMethod: string | null
  cardType: string | null
  serviceType: string
  customerGroup: string | null
  /** Gán riêng cho một chủ thể: USER hoặc MERCHANT. NULL = mọi chủ thể. */
  subjectType: string | null
  /** Mã chủ thể, khớp mã ví gửi lên dịch vụ phí. NULL = mọi chủ thể. */
  subjectId: string | null
  status: string
  /** Chờ áp dụng / Hết hạn; BE chỉ trả khi status = ACTIVE. */
  effectiveStatus?: FeeEffectiveStatus | null
  effectiveFromDate: string | null
  effectiveToDate: string | null
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface FeePolicyComponentWithTiers extends FeePolicyComponent {
  tiers: FeeComponentTier[]
}

export interface FeePolicyConfiguration {
  assignments: FeeAssignment[]
  components: FeePolicyComponentWithTiers[]
}

/** Một dòng của `GET /fee/payment-partners`. */
export interface FeePaymentPartner {
  code: string
  name: string
  provider: boolean
  issuer: boolean
  status: 'ACTIVE' | 'INACTIVE'
}

/** Một dòng của `GET /fee/banks` → `data.content`. */
export interface FeeBank {
  code: string
  name: string
}

/** Một dòng của `GET /fee/payment-partners`. */
export interface FeePaymentPartner {
  code: string
  name: string
  /** Cổng/nhà cung cấp thu tiền hộ FlexPay. */
  provider: boolean
  /** Ngân hàng thẻ/tài khoản. */
  issuer: boolean
  status: 'ACTIVE' | 'INACTIVE'
}

/** Trang dữ liệu Spring Data trả về. */
export interface FeePage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type FeePolicyScheduleAction = 'ACTIVATE' | 'DEACTIVATE'

export type FeePolicyScheduleStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'DONE'
  | 'SKIPPED'
  | 'FAILED'
  | 'CANCELLED'

/** Lịch hẹn giờ khóa / mở một chính sách phí. */
export interface FeePolicySchedule {
  id: string
  feePolicyId: string
  action: FeePolicyScheduleAction
  /** Thời điểm chạy, ISO-8601. */
  runAt: string
  status: FeePolicyScheduleStatus
  reason: string
  scheduledBy: string
  createdAt: string
  executedAt: string | null
  resultMessage: string | null
  /** Bước bắt đầu của khoảng mà lịch này kết thúc; null với lịch đơn lẻ. */
  dependsOnScheduleId?: string | null
}

/** Khóa / mở chính sách: không có `runAt` là làm ngay, có `runAt` là hẹn giờ. */
export interface ChangeFeePolicyStatusArg {
  policyId: string
  action: FeePolicyScheduleAction
  /** ISO-8601 instant, ví dụ 2026-10-20T01:00:00.000Z; bỏ trống = thực hiện ngay. */
  runAt?: string
  /** Kết thúc khoảng: tới lúc này tự làm hành động ngược lại; bỏ trống = không tự đảo. */
  endAt?: string
  reason: string
}

export interface FeePolicyStatusChangeResult {
  mode: 'IMMEDIATE' | 'SCHEDULED'
  /** Có khi `IMMEDIATE`: chính sách sau khi đổi trạng thái. */
  policy?: unknown
  /** Có khi `SCHEDULED`: lịch vừa tạo. */
  schedule?: FeePolicySchedule | null
  /** Bước kết thúc khoảng khi có `endAt`. */
  endSchedule?: FeePolicySchedule | null
}

export interface CancelFeePolicyScheduleArg {
  policyId: string
  scheduleId: string
}
