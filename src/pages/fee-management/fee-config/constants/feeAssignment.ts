import { FeeDomain } from '@components/fee/feeDomain'
import { allowsMerchantCriteria } from '@utils/fee-execution'

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

/** Nhãn ba mức phạm vi của thu hộ / chi hộ: đối tượng là merchant chứ không phải khách ví. */
export const MERCHANT_ASSIGNMENT_SCOPE_OPTIONS = [
  { value: ASSIGNMENT_SCOPE.ALL, label: 'Tất cả merchant' },
  { value: ASSIGNMENT_SCOPE.SEGMENT, label: 'Nhóm merchant' },
  { value: ASSIGNMENT_SCOPE.SUBJECT, label: 'Merchant cụ thể' }
] as const

/**
 * Luồng thu hộ / chi hộ có ba mức phạm vi theo merchant. Quyết định theo LOẠI GIAO DỊCH nên
 * chính sách merchant cũ mở ở màn nào cũng chạy như nhau. Chính sách miền Bank cũ giữ luật cũ
 * (ô Merchant đứng riêng, không có phạm vi) nên không tính là luồng merchant.
 */
export const isMerchantAssignmentFlow = (
  feeDomain: string | null | undefined,
  serviceType: string | null | undefined
): boolean =>
  feeDomain !== FeeDomain.BANK && allowsMerchantCriteria(serviceType)

export const getAssignmentScopeOptions = (
  serviceType: string | null | undefined
): readonly { value: AssignmentScope; label: string }[] =>
  allowsMerchantCriteria(serviceType)
    ? MERCHANT_ASSIGNMENT_SCOPE_OPTIONS
    : ASSIGNMENT_SCOPE_OPTIONS

/** Các cột bản gán mà phạm vi suy ngược ra từ đó. */
interface AssignmentScopeSource {
  merchantId?: string | null
  subjectId?: string | null
  customerGroup?: string | null
}

/**
 * Bản gán chỉ lưu tiêu chí, không lưu phạm vi; suy ngược ra để ô chọn hiện đúng thứ người tạo
 * đã chọn. Cá nhân trước vì nó hẹp hơn nhóm.
 *
 * Luồng merchant đọc cả `merchantId` (bản cũ chưa có cặp subject) lẫn `subjectId` (bản mới), và
 * dồn về ô `merchantId` duy nhất của form; lưu lại sẽ gửi đủ cặp chủ thể.
 */
export const toAssignmentScopeFields = (
  feeDomain: string | null | undefined,
  serviceType: string | null | undefined,
  assignment: AssignmentScopeSource | null | undefined
): {
  merchantId: string
  subjectId: string
  customerGroup: string
  assignmentScope: AssignmentScope
} => {
  const customerGroup = assignment?.customerGroup ?? ''
  if (isMerchantAssignmentFlow(feeDomain, serviceType)) {
    const merchantId = assignment?.merchantId ?? assignment?.subjectId ?? ''
    return {
      merchantId,
      subjectId: '',
      customerGroup,
      assignmentScope: merchantId
        ? ASSIGNMENT_SCOPE.SUBJECT
        : customerGroup
          ? ASSIGNMENT_SCOPE.SEGMENT
          : ASSIGNMENT_SCOPE.ALL
    }
  }
  const subjectId = assignment?.subjectId ?? ''
  return {
    merchantId: assignment?.merchantId ?? '',
    subjectId,
    customerGroup,
    assignmentScope: subjectId
      ? ASSIGNMENT_SCOPE.SUBJECT
      : customerGroup
        ? ASSIGNMENT_SCOPE.SEGMENT
        : ASSIGNMENT_SCOPE.ALL
  }
}
