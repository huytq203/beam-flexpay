import type { BankConfirmation } from '@type/stuckTransaction.type'
import { ReviewRejectOption } from '@/app/schemas/transaction-review.schema'
import type {
  ApproveReviewArg,
  RejectReviewArg
} from '@services/apiTransactionReview'
import type {
  ApproveReviewValues,
  RejectReviewValues
} from '../schemas/transactionReview.schema'

type BankValues = NonNullable<ApproveReviewValues['bankConfirmation']>

const toIso = (value: string | undefined): string =>
  value ? new Date(value).toISOString() : ''

/** Schema đã bảo đảm đủ trường theo `outcome`; ở đây chỉ chuẩn hoá định dạng gửi BE. */
export const toBankConfirmation = (
  bank: BankValues | undefined,
  outcome: BankConfirmation['outcome']
): BankConfirmation | undefined => {
  if (!bank) return undefined
  return {
    outcome,
    confirmationChannel: bank.confirmationChannel?.trim() ?? '',
    confirmationReference: bank.confirmationReference?.trim() ?? '',
    confirmedAt: toIso(bank.confirmedAt),
    ...(outcome === 'POSTED'
      ? {
          bankReference: bank.bankReference?.trim() ?? '',
          valueDate: bank.valueDate ?? '',
          bankBookedAt: toIso(bank.bankBookedAt)
        }
      : {})
  }
}

export const toApproveArg = (
  values: ApproveReviewValues,
  includeBankConfirmation: boolean
): Omit<ApproveReviewArg, 'transactionCode'> => {
  const bankConfirmation = includeBankConfirmation
    ? toBankConfirmation(values.bankConfirmation, 'POSTED')
    : undefined
  return {
    authCode: values.authCode.trim(),
    settlementId: values.settlementId.trim(),
    ...(values.note ? { note: values.note } : {}),
    ...(bankConfirmation ? { bankConfirmation } : {})
  }
}

export const toRejectArg = (
  values: RejectReviewValues,
  includeBankConfirmation: boolean
): Omit<RejectReviewArg, 'transactionCode'> => {
  const bankConfirmation = includeBankConfirmation
    ? toBankConfirmation(values.bankConfirmation, 'FAILED')
    : undefined
  return {
    option: values.option,
    reason: values.reason,
    ...(values.option === ReviewRejectOption.REFUND
      ? {
          refundAuthCode: values.refundAuthCode,
          refundSettlementId: values.refundSettlementId
        }
      : {}),
    ...(bankConfirmation ? { bankConfirmation } : {})
  }
}
