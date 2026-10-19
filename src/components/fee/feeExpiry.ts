import dayjs from 'dayjs'

interface ExpiryInput {
  status?: string | null
  /** BE chỉ trả khi status = ACTIVE: PENDING / ACTIVE / EXPIRED. */
  effectiveStatus?: string | null
  validTo?: string | null
}

/**
 * Chính sách đã hết hạn theo đúng cách nhãn "Hết hạn" được dựng: bản ACTIVE mà BE báo
 * `effectiveStatus = EXPIRED`, hoặc bản INIT (chưa duyệt) có `validTo` đã qua.
 *
 * Một nguồn duy nhất cho cả nhãn và việc ẩn thao tác, để hai nơi không lệch nhau.
 */
export const isPolicyExpired = ({
  status,
  effectiveStatus,
  validTo
}: ExpiryInput): boolean =>
  (status === 'INIT' && !!validTo && dayjs(validTo).isBefore(dayjs())) ||
  (status === 'ACTIVE' && effectiveStatus === 'EXPIRED')
