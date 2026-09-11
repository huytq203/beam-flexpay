/**
 * Kiểu dữ liệu module phí, khớp response của service `flexpay.fee`.
 *
 * Đặt ở tầng app vì ba nơi cùng đọc: tầng service, màn cấu hình phí và tab cấu
 * hình phí trong chi tiết ví. Trước đây chúng nằm trong thư mục của một màn cụ
 * thể, nên xoá màn là gãy tầng service.
 */

export interface FeePolicy {
  id: string
  /** Optimistic lock của BE — bắt buộc khi gọi API duyệt. */
  lockVersion?: number
  /** Mã băm nội dung bản ghi tại thời điểm checker xem — bắt buộc khi duyệt. */
  reviewHash?: string
  name: string
  serviceType: string
  feeDomain: string
  currency: string
  description?: string
  validFrom: string
  validTo: string | null
  status: string
  priority: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface FeePolicyComponent {
  id: string
  feePolicyId: string
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
  paymentMethod: string | null
  cardType: string | null
  serviceType: string
  customerGroup: string | null
  /** Gán riêng cho một chủ thể: USER hoặc MERCHANT. NULL = mọi chủ thể. */
  subjectType: string | null
  /** Mã chủ thể, khớp mã ví gửi lên dịch vụ phí. NULL = mọi chủ thể. */
  subjectId: string | null
  status: string
  effectiveFromDate: string | null
  effectiveToDate: string | null
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

/** Một dòng của `GET /fee/banks` → `data.content`. */
export interface FeeBank {
  code: string
  name: string
}

/** Trang dữ liệu Spring Data trả về. */
export interface FeePage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
