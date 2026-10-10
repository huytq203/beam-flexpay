import type { StuckTransactionUpdateFormValues } from '@/components/transaction/StuckTransaction.schema'
import {
  StuckTransactionOutcome,
  type StuckTransactionUpdateArg
} from '@type/stuckTransaction.type'

type CodeField =
  | 'authCode'
  | 'settlementId'
  | 'bankReference'
  | 'refundAuthCode'
  | 'refundSettlementId'
  | 'refundBankReference'

const SUCCESS_CODE_FIELDS: CodeField[] = [
  'authCode',
  'settlementId',
  'bankReference'
]
const REFUND_CODE_FIELDS: CodeField[] = [
  'refundAuthCode',
  'refundSettlementId',
  'refundBankReference'
]

const pickCodes = (
  values: StuckTransactionUpdateFormValues,
  fields: CodeField[],
  optionalFields: readonly string[]
): Partial<Record<CodeField, string>> => {
  const picked: Partial<Record<CodeField, string>> = {}
  for (const field of fields) {
    const value = values[field]?.trim()
    if (value && optionalFields.includes(field)) picked[field] = value
  }
  return picked
}

/**
 * Chỉ gửi những trường mà `optionalFields` của action cho phép. `bankReference` và
 * `receiptKey` chỉ đi cùng `POSTED` (BE trả 400 nếu kèm `FAILED`); `bankConfirmation`
 * không còn do admin nhập nên không bao giờ được gửi.
 */
export const toStuckTransactionUpdate = (
  transactionCode: string,
  values: StuckTransactionUpdateFormValues,
  optionalFields: readonly string[]
): StuckTransactionUpdateArg => {
  const { newStatus, note } = values
  const base = { transactionCode, newStatus, note }

  if (newStatus === StuckTransactionOutcome.POSTED) {
    const receiptKey = optionalFields.includes('receiptKey')
      ? values.receipt?.receiptKey
      : undefined
    return {
      ...base,
      ...pickCodes(values, SUCCESS_CODE_FIELDS, optionalFields),
      ...(receiptKey ? { receiptKey } : {})
    }
  }

  if (!values.refund || !optionalFields.includes('refund')) return base
  return {
    ...base,
    refund: true,
    ...pickCodes(values, REFUND_CODE_FIELDS, optionalFields)
  }
}
