import type { StuckTransactionUpdateFormValues } from '@/components/transaction/StuckTransaction.schema'
import type { StuckTransactionUpdateArg } from '@type/stuckTransaction.type'

export const toStuckTransactionUpdate = (
  transactionCode: string,
  values: StuckTransactionUpdateFormValues,
  requireBankConfirmation: boolean,
  allowBankConfirmation: boolean
): StuckTransactionUpdateArg => {
  const {
    newStatus,
    note,
    authCode,
    settlementId,
    bankConfirmation: bank
  } = values
  return {
    transactionCode,
    newStatus,
    note,
    ...(newStatus === 'POSTED' ? { authCode, settlementId } : {}),
    ...(allowBankConfirmation &&
    (requireBankConfirmation || values.includeBankConfirmation) &&
    bank
      ? {
          bankConfirmation: {
            outcome: newStatus,
            confirmationChannel: bank.confirmationChannel!.trim(),
            confirmationReference: bank.confirmationReference!.trim(),
            confirmedAt: new Date(bank.confirmedAt!).toISOString(),
            ...(newStatus === 'POSTED'
              ? {
                  bankReference: bank.bankReference!.trim(),
                  valueDate: bank.valueDate!,
                  bankBookedAt: new Date(bank.bankBookedAt!).toISOString()
                }
              : {})
          }
        }
      : {})
  }
}
