import type { ContentEKYC } from '@type/apiResponseEKYC'

const APPLIED_STATUSES = new Set(['COMPLETED', 'VERIFIED', 'MANUALLY_APPROVED'])
const RUNNING_STATUSES = new Set(['INITIATED', 'IN_PROGRESS'])

/** Phiên thành công mới nhất — phiên mà hồ sơ đang dùng; các phiên khác chỉ là lịch sử. */
export const findAppliedAttempt = (
  attempts: readonly ContentEKYC[]
): ContentEKYC | undefined =>
  attempts
    .filter((attempt) => APPLIED_STATUSES.has(attempt.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

/**
 * Phiên bỏ dở vẫn có thể mang status "đang chạy" sau khi quá expiresAt; thực chất nó đã dừng,
 * nên hiển thị là hết hạn để không lẫn với phiên đang làm thật.
 */
export const isStalledAttempt = (
  attempt: ContentEKYC,
  now: number = Date.now()
): boolean =>
  RUNNING_STATUSES.has(attempt.status) &&
  !!attempt.expiresAt &&
  Date.parse(attempt.expiresAt) <= now
