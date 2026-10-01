import type { EKYCListItem } from '@type/apiResponseEKYC'

/** BE đặt phiên cần xét duyệt ở attempts[1]. */
export const getReviewSessionId = (record: EKYCListItem): string | null => {
  const attempt = record.attempts[1]
  if (attempt?.status !== 'PENDING_REVIEW') return null
  return attempt?.sessionId ?? attempt?.ekycSessionId ?? null
}
