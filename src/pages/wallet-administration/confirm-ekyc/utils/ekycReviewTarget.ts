import type { EKYCListItem } from '@type/apiResponseEKYC'

/** Phiên cần xét duyệt là phiên PENDING_REVIEW mới nhất, không phụ thuộc vị trí trong mảng. */
export const getReviewSessionId = (record: EKYCListItem): string | null => {
  const attempt = record.attempts
    .filter((item) => item.status === 'PENDING_REVIEW')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  return attempt?.sessionId ?? attempt?.ekycSessionId ?? null
}
