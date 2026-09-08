/**
 * Body bắt buộc của `PATCH /fee/policies/{id}/approve` và
 * `PATCH /fee/policy-assignments/{id}/approve` (BE: `FeeApprovalDecisionRequest`).
 *
 * BE dùng optimistic lock cho luồng maker–checker: checker phải gửi lại đúng
 * phiên bản (`lockVersion`) và mã băm nội dung (`reviewHash`) của bản ghi mà
 * mình đã xem. Nếu maker sửa bản ghi ở giữa, hai giá trị này lệch và lệnh duyệt
 * bị từ chối thay vì duyệt nhầm nội dung mới.
 */
export interface FeeApprovalDecisionRequest {
  expectedLockVersion: number
  expectedReviewHash: string
}

/** Tham số mutation duyệt: id trên URL + body quyết định. */
export interface FeeApprovalArg extends FeeApprovalDecisionRequest {
  id: string
}

/**
 * Tham số cho các endpoint fee bắt buộc query param `reason` (tối đa 500 ký tự):
 * `PATCH /fee/policies/{id}/activate`, `PATCH /fee/policies/{id}/reject`,
 * `PATCH /fee/policy-assignments/{id}/activate`,
 * `PATCH /fee/policy-assignments/{id}/reject`.
 * BE ghi lý do này vào audit history của luồng maker–checker.
 */
export interface FeeReasonArg {
  id: string
  reason: string
}

/** Giới hạn độ dài `reason` theo OpenAPI của fee-service. */
export const FEE_REASON_MAX_LENGTH = 500
