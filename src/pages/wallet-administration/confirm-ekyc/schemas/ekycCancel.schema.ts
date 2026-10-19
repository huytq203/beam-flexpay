import { z } from 'zod'

export const EKYC_CANCEL_REASON_MAX_LENGTH = 500

export const ekycCancelSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do hủy')
    .max(
      EKYC_CANCEL_REASON_MAX_LENGTH,
      `Lý do tối đa ${EKYC_CANCEL_REASON_MAX_LENGTH} ký tự`
    )
})

export type EkycCancelFormValues = z.infer<typeof ekycCancelSchema>
