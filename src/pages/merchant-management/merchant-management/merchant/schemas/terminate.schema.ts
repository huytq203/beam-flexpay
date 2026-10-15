import { z } from 'zod'

export const terminateSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập lý do chấm dứt hợp tác')
    .min(10, 'Lý do phải từ 10 đến 500 ký tự')
    .max(500, 'Lý do phải từ 10 đến 500 ký tự'),
  confirmation: z
    .string()
    .trim()
    .min(1, 'Vui lòng gõ lại mã hoặc tên merchant để xác nhận')
    .max(255, 'Chuỗi xác nhận tối đa 255 ký tự')
})

export type TerminateForm = z.infer<typeof terminateSchema>
