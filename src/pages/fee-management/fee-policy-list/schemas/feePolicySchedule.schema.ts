import dayjs from 'dayjs'
import { z } from 'zod'
import {
  SCHEDULE_MAX_LEAD_DAYS,
  SCHEDULE_MIN_LEAD_MS,
  SCHEDULE_REASON_MAX_LENGTH
} from '../constants/feePolicySchedule'

/**
 * `runAt` là chuỗi giờ địa phương của trình duyệt do FormDatePicker trả về
 * (YYYY-MM-DDTHH:mm:ss.SSS, không có múi giờ). Mốc "bây giờ" đọc lúc kiểm tra
 * để schema không bị cũ khi dialog mở lâu.
 */
export const feePolicyScheduleSchema = z
  .object({
    action: z.enum(['ACTIVATE', 'DEACTIVATE'], 'Vui lòng chọn hành động'),
    runAt: z.string().min(1, 'Vui lòng chọn thời điểm chạy'),
    reason: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập lý do')
      .max(
        SCHEDULE_REASON_MAX_LENGTH,
        `Lý do tối đa ${SCHEDULE_REASON_MAX_LENGTH} ký tự`
      )
  })
  .superRefine((value, ctx) => {
    if (!value.runAt) return
    const runAt = dayjs(value.runAt)
    if (!runAt.isValid()) {
      ctx.addIssue({
        code: 'custom',
        path: ['runAt'],
        message: 'Thời điểm chạy không hợp lệ'
      })
      return
    }
    const now = Date.now()
    if (runAt.valueOf() < now + SCHEDULE_MIN_LEAD_MS) {
      ctx.addIssue({
        code: 'custom',
        path: ['runAt'],
        message: 'Thời điểm chạy phải sau thời điểm hiện tại ít nhất 1 phút'
      })
    } else if (
      runAt.valueOf() > dayjs(now).add(SCHEDULE_MAX_LEAD_DAYS, 'day').valueOf()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['runAt'],
        message: 'Thời điểm chạy không được quá 1 năm kể từ bây giờ'
      })
    }
  })

export type FeePolicyScheduleFormValues = z.infer<
  typeof feePolicyScheduleSchema
>
