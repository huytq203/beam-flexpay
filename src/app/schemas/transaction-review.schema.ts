import { z } from 'zod'

/** `mode` của `allowedActions[]` trong snapshot `refresh` cho lệnh nạp. */
export const ReviewMode = {
  MARK_REVIEW: 'MARK_REVIEW',
  REVIEW_APPROVE: 'REVIEW_APPROVE',
  REVIEW_REJECT: 'REVIEW_REJECT'
} as const
export type ReviewMode = (typeof ReviewMode)[keyof typeof ReviewMode]

export const REVIEW_STATUS = 'REVIEW'
export const BANK_CONFIRMATION_FIELD = 'bankConfirmation'

export const ReviewRejectOption = {
  CANCEL_ONLY: 'CANCEL_ONLY',
  REFUND: 'REFUND'
} as const
export type ReviewRejectOption =
  (typeof ReviewRejectOption)[keyof typeof ReviewRejectOption]

const allowedActionSchema = z.object({
  status: z.string().nullish(),
  mode: z.string(),
  requiredFields: z.array(z.string()).nullish(),
  /** Trường nhập thêm cho action; vắng với action Review. */
  optionalFields: z.array(z.string()).nullish()
})
export type AllowedAction = z.infer<typeof allowedActionSchema>

/** Kết quả hỏi nhà cung cấp của `refresh`; mọi trường có thể vắng. */
const bankCheckSchema = z.object({
  source: z.string().nullish(),
  status: z.string().nullish(),
  reference: z.string().nullish(),
  detail: z.string().nullish()
})
export type BankCheck = z.infer<typeof bankCheckSchema>

/** Chỉ khai các trường FE dùng; phần còn lại của snapshot bị bỏ qua. */
export const transactionSnapshotSchema = z.object({
  transactionCode: z.string().nullish(),
  status: z.string().nullish(),
  bankCheck: bankCheckSchema.nullish(),
  allowedActions: z.array(allowedActionSchema).nullish()
})
export type TransactionSnapshot = z.infer<typeof transactionSnapshotSchema>

/** `AdminTransactionUpdateResponse` dùng chung cho `review`, `approve`, `reject`. */
export const transactionReviewResultSchema = z.object({
  transactionCode: z.string(),
  transactionType: z.string().nullish(),
  requestId: z.string().nullish(),
  previousStatus: z.string().nullish(),
  newStatus: z.string(),
  displayStatus: z.string().nullish(),
  reviewDecision: z.string().nullish(),
  journalId: z.string().nullish(),
  transactionId: z.string().nullish(),
  bankConfirmationId: z.string().nullish(),
  refundCode: z.string().nullish(),
  authCode: z.string().nullish(),
  settlementId: z.string().nullish(),
  note: z.string().nullish(),
  updatedBy: z.string().nullish(),
  updatedAt: z.string().nullish()
})
export type TransactionReviewResult = z.infer<
  typeof transactionReviewResultSchema
>

export const transactionSnapshotEnvelopeSchema = z.object({
  success: z.boolean().nullish(),
  data: transactionSnapshotSchema
})

export const transactionReviewEnvelopeSchema = z.object({
  success: z.boolean().nullish(),
  data: transactionReviewResultSchema
})
