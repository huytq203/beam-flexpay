import { z } from 'zod'

const allowedActionSchema = z.object({
  status: z.string().nullish(),
  mode: z.string(),
  requiredFields: z.array(z.string()).nullish(),
  /** Trường hiển thị nhưng không bắt buộc (SRS 3.2.7), dùng để dựng form cập nhật treo. */
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

export const transactionSnapshotEnvelopeSchema = z.object({
  success: z.boolean().nullish(),
  data: transactionSnapshotSchema
})
