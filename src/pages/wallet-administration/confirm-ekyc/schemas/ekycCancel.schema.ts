import { z } from 'zod'

export const EKYC_CANCEL_REASON_MIN_LENGTH = 10
export const EKYC_CANCEL_REASON_MAX_LENGTH = 500

export const ekycCancelSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(
      EKYC_CANCEL_REASON_MIN_LENGTH,
      `Lý do phải từ ${EKYC_CANCEL_REASON_MIN_LENGTH} ký tự trở lên`
    )
    .max(
      EKYC_CANCEL_REASON_MAX_LENGTH,
      `Lý do tối đa ${EKYC_CANCEL_REASON_MAX_LENGTH} ký tự`
    )
})

export type EkycCancelFormValues = z.infer<typeof ekycCancelSchema>
