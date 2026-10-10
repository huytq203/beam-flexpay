import {
  BANK_CONFIRMATION_FIELD,
  REVIEW_STATUS,
  ReviewMode,
  type AllowedAction,
  type TransactionSnapshot
} from '@/app/schemas/transaction-review.schema'
import { isSameUsername, normalizeUsername } from '@utils/username'
import {
  CASH_IN_TYPE,
  REVIEW_ELIGIBLE_STATUSES
} from '../constants/transactionReview.constant'

/** Panel Review chỉ dành cho lệnh nạp còn ở nhóm treo. */
export const isReviewCandidate = (
  transactionType: string | null | undefined,
  journalStatus: string | null | undefined
): boolean =>
  transactionType === CASH_IN_TYPE &&
  typeof journalStatus === 'string' &&
  REVIEW_ELIGIBLE_STATUSES.includes(journalStatus)

/**
 * Maker ≠ checker. Chỉ biết người đánh dấu khi chính phiên này vừa đánh dấu (BE không
 * trả lại trong snapshot); không biết thì không ẩn, BE vẫn chặn bằng 400.
 */
export const isMarker = (
  markedBy: string | null | undefined,
  username: string
): boolean => isSameUsername(markedBy, username)

export const findAllowedAction = (
  snapshot: TransactionSnapshot | undefined,
  mode: ReviewMode
): AllowedAction | undefined =>
  snapshot?.allowedActions?.find((action) => action.mode === mode)

export const requiresBankConfirmation = (
  action: AllowedAction | undefined
): boolean => action?.requiredFields?.includes(BANK_CONFIRMATION_FIELD) ?? false

export interface ReviewViewContext {
  canFull: boolean
  canReview: boolean
  username: string
  snapshot: TransactionSnapshot | undefined
  markedBy: string | null | undefined
}

export interface ReviewView {
  isUnderReview: boolean
  isMarker: boolean
  showMark: boolean
  showApprove: boolean
  showReject: boolean
  approveNeedsBank: boolean
  rejectNeedsBank: boolean
  /** Người chỉ có `TRANSACTION:REVIEW` không gọi được `refresh` nên không đọc được trạng thái. */
  isStatusUnreadable: boolean
}

export const getReviewView = (context: ReviewViewContext): ReviewView => {
  const { canFull, canReview, username, snapshot, markedBy } = context
  const approve = findAllowedAction(snapshot, ReviewMode.REVIEW_APPROVE)
  const reject = findAllowedAction(snapshot, ReviewMode.REVIEW_REJECT)
  const marker = isMarker(markedBy, username)
  const markedInSession = normalizeUsername(markedBy) !== ''
  const markAllowed = snapshot
    ? findAllowedAction(snapshot, ReviewMode.MARK_REVIEW) !== undefined
    : !canFull && !markedInSession
  return {
    isUnderReview: snapshot?.status === REVIEW_STATUS,
    isMarker: marker,
    showMark: canReview && markAllowed,
    showApprove: canReview && approve !== undefined && !marker,
    showReject: canReview && reject !== undefined && !marker,
    approveNeedsBank: requiresBankConfirmation(approve),
    rejectNeedsBank: requiresBankConfirmation(reject),
    isStatusUnreadable: canReview && !canFull
  }
}
