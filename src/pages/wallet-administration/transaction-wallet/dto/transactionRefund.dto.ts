import { formatNumber } from '@utils/formatNumber'
import { StatusEnum } from '../constants/Transaction.constant'
import {
  unifiedRefundFieldsSchema,
  type UnifiedRefundFields
} from '@/app/schemas/unified-refund.schema'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import {
  RefundOriginalType,
  type CreateRefundRequest
} from '@pages/transaction-management/refund-management/schemas/refund.schema'
import {
  BENEFICIARY_PLACEHOLDER,
  REFUND_CHANNEL_BY_TYPE
} from '../constants/transactionRefund.constant'
import type { CreateRefundFormValues } from '../schemas/createRefund.schema'

export const EMPTY_REFUND_VALUE = '-'

/** Nhãn hiển thị theo `displayStatus`; thiếu thì rơi về `status` sổ cái. */
export const getDisplayStatus = (
  row: Pick<UnifiedContentJournal, 'status' | 'displayStatus'>
): string => row.displayStatus || row.status

/** Đọc lại 4 trường hoàn tiền qua Zod; trường lạ kiểu thì coi như chưa biết (`null`). */
export const readRefundFields = (row: object): UnifiedRefundFields => {
  const parsed = unifiedRefundFieldsSchema.safeParse(row)
  return parsed.success ? parsed.data : {}
}

/** `null` nghĩa là BE không tra được, hiển thị "-" chứ không phải 0. */
export const formatRefundedAmount = (
  row: Pick<UnifiedContentJournal, 'currency'>,
  fields: UnifiedRefundFields
): string =>
  fields.refundedAmount == null
    ? EMPTY_REFUND_VALUE
    : `${formatNumber(fields.refundedAmount)} ${row.currency}`

export const getPendingRefundAmount = (
  fields: UnifiedRefundFields
): number | null =>
  fields.pendingRefundAmount != null && fields.pendingRefundAmount > 0
    ? fields.pendingRefundAmount
    : null

/** Bộ lọc "Có hoàn tiền?": rỗng là không lọc, nên không gửi param. */
export const toHasRefundParam = (value?: string): boolean | undefined => {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

/**
 * "Thất bại" phải tách khỏi "Thất bại hoàn tiền": sổ cái ghi cả hai là FAILED, nên khi lọc
 * Thất bại mà người dùng chưa chọn "Có hoàn tiền?" thì gửi `hasRefund=false` để loại các
 * lệnh đã sinh bản ghi hoàn.
 */
export const resolveHasRefundParam = (filter: {
  status?: string
  hasRefund?: string
}): boolean | undefined => {
  const hasRefund = toHasRefundParam(filter.hasRefund)
  if (hasRefund !== undefined) return hasRefund
  return filter.status === StatusEnum.FAILED ? false : undefined
}

export const getRefundOriginalType = (
  transactionType: string
): RefundOriginalType | null =>
  Object.values(RefundOriginalType).find((type) => type === transactionType) ??
  null

/**
 * `originalTransactionId` là `Transaction.id` của wallet-core, tức `transactionId`
 * của dòng, không phải mã giao dịch. Thiếu id hoặc loại không hoàn được thì không
 * dựng được yêu cầu.
 */
export const buildCreateRefundRequest = (
  transaction: Pick<UnifiedContentJournal, 'transactionId' | 'transactionType'>,
  values: CreateRefundFormValues
): CreateRefundRequest | null => {
  const originalType = getRefundOriginalType(transaction.transactionType)
  if (!transaction.transactionId || !originalType) return null
  const channel = REFUND_CHANNEL_BY_TYPE[originalType]
  return {
    originalTransactionId: transaction.transactionId,
    requestedAmount: values.requestedAmount,
    channel,
    reason: values.reason,
    sendNotification: values.sendNotification,
    createdSource: 'ADMIN_PORTAL',
    ...(channel === 'TO_BANK' ? BENEFICIARY_PLACEHOLDER : {})
  }
}
