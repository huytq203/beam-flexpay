import { RefundDisplayStatus, RefundType } from '@constants/refund.constant'
import type { RefundListParams } from '@services/apiRefund'
import { formatCurrency } from '@utils/formatNumber'
import { isSameUsername } from '@utils/username'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  RefundChannel,
  RefundSource,
  RefundStatus,
  type RefundDetail,
  type RefundListItem,
  type RefundTarget
} from '../schemas/refund.schema'
import type { RefundFilterKey } from '../constants/refund.constants'

export const EMPTY_VALUE = '-'
const GENERIC_ERROR = 'Có lỗi xảy ra, vui lòng thử lại.'
const NETWORK_ERROR = 'Không kết nối được máy chủ, vui lòng thử lại.'

export const formatVnd = (value?: number | null): string =>
  value === null || value === undefined
    ? EMPTY_VALUE
    : formatCurrency(value, { symbol: 'đ', locale: 'vi-VN' })

export const formatDateTime = (value?: string | null): string =>
  formatUTCToLocalDateTime(value) || EMPTY_VALUE

export const truncateText = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max)}...` : text

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined

const readValidationMessages = (data: unknown): string[] =>
  isRecord(data)
    ? Object.values(data).filter(
        (item): item is string => typeof item === 'string' && item !== ''
      )
    : []

/**
 * Câu lỗi hiển thị cho người dùng: `detail` tiếng Việt nguyên văn; lỗi Bean Validation
 * (`message = VALIDATION_ERROR`, `detail` là câu tiếng Anh cố định) thì đọc map `data`.
 * Không dùng `message` vì đó là tên enum kỹ thuật (BUSINESS_ERROR...).
 */
export const getRefundErrorText = (error: unknown): string => {
  if (!isRecord(error) || !('status' in error)) return GENERIC_ERROR
  if (error.status === 'FETCH_ERROR') return NETWORK_ERROR
  const body = error.data
  if (!isRecord(body)) return GENERIC_ERROR
  if (body.message === 'VALIDATION_ERROR') {
    const messages = readValidationMessages(body.data)
    if (messages.length > 0) return messages.join(' ')
  }
  const message = readText(body.message)
  return (
    readText(body.detail) ??
    (message && !/^[A-Z0-9_]+$/.test(message) ? message : GENERIC_ERROR)
  )
}

/** Nhãn trạng thái theo `displayStatus`; BE chưa trả thì dùng `status` (cùng giá trị trừ FAILED_REFUND). */
export const getDisplayStatus = (
  refund: Pick<RefundListItem, 'status' | 'displayStatus'>
): RefundDisplayStatus => refund.displayStatus ?? refund.status

export interface RefundActionContext {
  username: string
  canApprove: boolean
  /** Quyền Kế toán duyệt chi / từ chối chi hoàn tiền ra ngân hàng. */
  canPayoutApprove: boolean
  canSettle: boolean
  canPayoutRefresh: boolean
}

export interface RefundActionFlags {
  decide: boolean
  /** Duyệt chi / từ chối chi: không chặn người tạo (chốt 23/10/2026), chỉ cần đúng trạng thái và quyền. */
  payoutDecide: boolean
  settle: boolean
  payoutRefresh: boolean
  /** Chi thành công / Chi thất bại cho lệnh chi hoàn MANUAL đang chờ chốt tay. */
  manualPayoutSuccess: boolean
  manualPayoutFail: boolean
  isOwnRequest: boolean
}

type RefundActionSubject = Pick<
  RefundTarget,
  | 'status'
  | 'channel'
  | 'createdBy'
  | 'awaitingManualConfirmation'
  | 'payoutRefreshable'
>

const IN_FLIGHT_STATUSES: readonly RefundStatus[] = [
  RefundStatus.PROCESSING,
  RefundStatus.WAITING_FUNDS
]

/**
 * Duyệt/Từ chối cần biết người tạo: thiếu `createdBy` (danh sách BE không trả, chỉ có ở
 * chi tiết) hoặc thiếu username đăng nhập thì ẩn, không đoán. BE vẫn chặn lại ở bước duyệt.
 */
export const getRefundActions = (
  refund: RefundActionSubject,
  context: RefundActionContext
): RefundActionFlags => {
  const createdBy = refund.createdBy ?? ''
  const canCompare = createdBy.trim() !== '' && context.username.trim() !== ''
  const isOwnRequest = canCompare && isSameUsername(createdBy, context.username)
  const inFlight = IN_FLIGHT_STATUSES.includes(refund.status)
  // Đọc đúng cờ BE trả về, không tự suy từ trạng thái/ngân hàng. Quyền khớp
  // `manual-payout` (PAYOUT:APPROVE), như duyệt chi.
  const manualPayout =
    refund.awaitingManualConfirmation === true && context.canPayoutApprove
  return {
    manualPayoutSuccess: manualPayout,
    manualPayoutFail: manualPayout,
    isOwnRequest,
    payoutDecide:
      refund.status === RefundStatus.PENDING_PAYOUT_APPROVAL &&
      context.canPayoutApprove,
    decide:
      refund.status === RefundStatus.PENDING_APPROVAL &&
      context.canApprove &&
      canCompare &&
      !isOwnRequest,
    settle:
      inFlight &&
      refund.channel === RefundChannel.TO_WALLET &&
      context.canSettle,
    // Đọc đúng cờ BE: chỉ lệnh chi đang chờ đối soát và đã từng gửi ngân hàng mới làm mới được
    // (lệnh đang chi, chờ đủ tiền, chi tay MANUAL đều bị BE từ chối nên không hiện nút).
    payoutRefresh:
      inFlight &&
      refund.channel === RefundChannel.TO_BANK &&
      refund.payoutRefreshable === true &&
      context.canPayoutRefresh
  }
}

export const getSettleLabel = (
  refund: Pick<RefundTarget, 'status' | 'failureReason'>
): string =>
  refund.status === RefundStatus.PROCESSING && refund.failureReason
    ? 'Quyết toán lại'
    : 'Quyết toán'

export type RefundFilters = Partial<Record<RefundFilterKey, string>>

const isOneOf = <T extends string>(
  values: Record<string, T>,
  value: string | undefined
): value is T =>
  value !== undefined && Object.values(values).includes(value as T)

const DATE_PART = /^\d{4}-\d{2}-\d{2}/

const toDatePart = (value: string | undefined): string | undefined =>
  value !== undefined && DATE_PART.test(value) ? value.slice(0, 10) : undefined

/** Định dạng ISO không múi giờ, chờ BE xác nhận `RefundSearchCriteria` có nhận không. */
export const buildRefundParams = (
  filters: RefundFilters,
  page: number,
  size: number
): RefundListParams => {
  const from = toDatePart(filters.createdFrom)
  const to = toDatePart(filters.createdTo)
  const keyword = filters.keyword?.trim()
  return {
    page: page - 1,
    size,
    sort: 'createdAt,desc',
    keyword: keyword || undefined,
    status: isOneOf(RefundStatus, filters.status) ? filters.status : undefined,
    displayStatus: isOneOf(RefundDisplayStatus, filters.displayStatus)
      ? filters.displayStatus
      : undefined,
    refundType: isOneOf(RefundType, filters.refundType)
      ? filters.refundType
      : undefined,
    channel: isOneOf(RefundChannel, filters.channel)
      ? filters.channel
      : undefined,
    createdSource: isOneOf(RefundSource, filters.createdSource)
      ? filters.createdSource
      : undefined,
    createdFrom: from ? `${from}T00:00:00` : undefined,
    createdTo: to ? `${to}T23:59:59` : undefined
  }
}

export const hasActiveFilters = (filters: RefundFilters): boolean =>
  Object.values(filters).some((value) => value !== undefined && value !== '')

export type RefundRecord = RefundListItem | RefundDetail
