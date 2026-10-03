import {
  bankConfirmationFieldsSchema,
  validateBankConfirmation
} from '@pages/transaction-management/stuck-transaction/schemas/bankConfirmation.schema'
import { z } from 'zod'
import {
  STUCK_UPDATE_CODE_MAX_LENGTH,
  STUCK_UPDATE_NOTE_MAX_LENGTH,
  STUCK_UPDATE_NOTE_MIN_LENGTH,
  StuckTransactionOutcome
} from '@type/stuckTransaction.type'

const optionalCode = (label: string) =>
  z
    .string()
    .trim()
    .max(
      STUCK_UPDATE_CODE_MAX_LENGTH,
      `${label} tối đa ${STUCK_UPDATE_CODE_MAX_LENGTH} ký tự`
    )
    .optional()

/**
 * Form chốt kết quả giao dịch treo.
 */
export const createStuckTransactionUpdateSchema = (
  requireBankConfirmation = false
) =>
  z
    .object({
      includeBankConfirmation: z.boolean().optional(),
      bankConfirmation: bankConfirmationFieldsSchema.optional(),
      newStatus: z.enum(
        [StuckTransactionOutcome.POSTED, StuckTransactionOutcome.FAILED],
        'Vui lòng chọn kết quả cuối của giao dịch'
      ),
      authCode: optionalCode('Auth Code'),
      settlementId: optionalCode('Settlement ID'),
      note: z
        .string()
        .trim()
        .min(
          STUCK_UPDATE_NOTE_MIN_LENGTH,
          `Lý do phải từ ${STUCK_UPDATE_NOTE_MIN_LENGTH} ký tự trở lên`
        )
        .max(
          STUCK_UPDATE_NOTE_MAX_LENGTH,
          `Lý do tối đa ${STUCK_UPDATE_NOTE_MAX_LENGTH} ký tự`
        )
    })
    .superRefine((values, ctx) =>
      validateBankConfirmation(values, ctx, requireBankConfirmation)
    )

export const stuckTransactionUpdateSchema = createStuckTransactionUpdateSchema()

export type StuckTransactionUpdateFormValues = z.infer<
  typeof stuckTransactionUpdateSchema
>
