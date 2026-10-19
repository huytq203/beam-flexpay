import { z } from 'zod'

export const terminateSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do chấm dứt hợp tác')
    .max(500, 'Lý do tối đa 500 ký tự'),
  confirmation: z
    .string()
    .trim()
    .min(1, 'Vui lòng gõ lại mã hoặc tên merchant để xác nhận')
    .max(255, 'Chuỗi xác nhận tối đa 255 ký tự')
})

export type TerminateForm = z.infer<typeof terminateSchema>
