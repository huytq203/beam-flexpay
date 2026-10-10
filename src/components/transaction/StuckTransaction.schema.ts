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

/** Biên lai đã upload: `receiptKey` gửi BE, hai trường còn lại chỉ để hiển thị. */
const receiptSchema = z.object({
  receiptKey: z.string(),
  fileName: z.string(),
  sizeBytes: z.number()
})

/**
 * Form chốt kết quả giao dịch treo. Chỉ Lý do bắt buộc; mọi mã đối soát đều tuỳ chọn
 * và việc trường nào được hiển thị/gửi do `optionalFields` của snapshot quyết định.
 */
export const stuckTransactionUpdateSchema = z.object({
  newStatus: z.enum(
    [StuckTransactionOutcome.POSTED, StuckTransactionOutcome.FAILED],
    'Vui lòng chọn kết quả cuối của giao dịch'
  ),
  authCode: optionalCode('Auth Code'),
  settlementId: optionalCode('Settlement ID'),
  bankReference: optionalCode('Mã tham chiếu'),
  receipt: receiptSchema.optional(),
  refund: z.boolean().optional(),
  refundAuthCode: optionalCode('Mã chuẩn chi (hoàn)'),
  refundSettlementId: optionalCode('Mã đối soát (hoàn)'),
  refundBankReference: optionalCode('Mã tham chiếu (hoàn)'),
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

export type StuckTransactionUpdateFormValues = z.infer<
  typeof stuckTransactionUpdateSchema
>
