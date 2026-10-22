import type { FeePolicyScheduleAction } from '@type/fee.type'
import dayjs from 'dayjs'
import { z } from 'zod'
import {
  SCHEDULE_MAX_LEAD_DAYS,
  SCHEDULE_MIN_LEAD_MS,
  SCHEDULE_REASON_MAX_LENGTH
} from '../constants/feePolicySchedule'

export const RUN_AT_REQUIRED_MESSAGE =
  'Thao tác này không thực hiện ngay được với trạng thái hiện tại, vui lòng chọn thời điểm chạy'

export const END_AT_AFTER_START_MESSAGE =
  'Thời điểm kết thúc phải sau thời điểm bắt đầu ít nhất 1 phút'

/**
 * Kết thúc khoảng: bỏ trống là không tự đảo. Có giá trị thì phải sau lúc bắt đầu (hoặc sau bây giờ khi
 * làm ngay) ít nhất 1 phút và không quá 1 năm, khớp kiểm tra của BE trước khi đổi trạng thái.
 */
const validateEndAt = (
  runAt: string | undefined,
  endAt: string | undefined,
  ctx: z.RefinementCtx
) => {
  if (!endAt) return
  const end = dayjs(endAt)
  if (!end.isValid()) {
    ctx.addIssue({
      code: 'custom',
      path: ['endAt'],
      message: 'Thời điểm kết thúc không hợp lệ'
    })
    return
  }
  const now = Date.now()
  const start = runAt && dayjs(runAt).isValid() ? dayjs(runAt).valueOf() : now
  if (end.valueOf() < start + SCHEDULE_MIN_LEAD_MS) {
    ctx.addIssue({
      code: 'custom',
      path: ['endAt'],
      message: END_AT_AFTER_START_MESSAGE
    })
  } else if (
    end.valueOf() > dayjs(now).add(SCHEDULE_MAX_LEAD_DAYS, 'day').valueOf()
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['endAt'],
      message: 'Thời điểm kết thúc không được quá 1 năm kể từ bây giờ'
    })
  }
}

/**
 * Khóa / mở chính sách: bỏ trống `runAt` là làm ngay, có `runAt` là hẹn giờ.
 *
 * Làm ngay chỉ có một hành động hợp lệ là `immediateAction` (đảo trạng thái hiện tại), nên hành động
 * khác bắt buộc phải có thời điểm. `runAt` là chuỗi giờ địa phương của trình duyệt do FormDatePicker trả
 * về (YYYY-MM-DDTHH:mm:ss.SSS, không có múi giờ). Mốc "bây giờ" đọc lúc kiểm tra để schema không bị cũ
 * khi dialog mở lâu.
 */
export const buildStatusChangeSchema = (
  immediateAction: FeePolicyScheduleAction
) =>
  z
    .object({
      action: z.enum(['ACTIVATE', 'DEACTIVATE'], 'Vui lòng chọn hành động'),
      runAt: z.string().optional(),
      endAt: z.string().optional(),
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
      validateEndAt(value.runAt, value.endAt, ctx)
      if (!value.runAt) {
        if (value.action !== immediateAction) {
          ctx.addIssue({
            code: 'custom',
            path: ['runAt'],
            message: RUN_AT_REQUIRED_MESSAGE
          })
        }
        return
      }
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
        runAt.valueOf() >
        dayjs(now).add(SCHEDULE_MAX_LEAD_DAYS, 'day').valueOf()
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['runAt'],
          message: 'Thời điểm chạy không được quá 1 năm kể từ bây giờ'
        })
      }
    })

export type FeePolicyStatusChangeFormValues = z.infer<
  ReturnType<typeof buildStatusChangeSchema>
>
