import type { FeeApprovalDecisionRequest } from '@type/feeApproval.type'

interface ReviewableRecord {
  lockVersion?: number
  reviewHash?: string
}

export const MISSING_REVIEW_INFO_MESSAGE =
  'Thiếu thông tin phiên bản kiểm duyệt. Vui lòng tải lại danh sách rồi thử lại.'

/**
 * Dựng body cho API duyệt phí từ bản ghi mà checker đang xem.
 * Trả `null` khi BE chưa gửi đủ cặp `lockVersion` + `reviewHash` — lúc đó không
 * được gọi API vì BE sẽ từ chối và người dùng không hiểu vì sao.
 */
export const getFeeApprovalDecision = (
  record: ReviewableRecord
): FeeApprovalDecisionRequest | null => {
  const { lockVersion, reviewHash } = record

  if (typeof lockVersion !== 'number' || !reviewHash) return null

  return { expectedLockVersion: lockVersion, expectedReviewHash: reviewHash }
}
