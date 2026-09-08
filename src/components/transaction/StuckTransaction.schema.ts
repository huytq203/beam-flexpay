import { z } from 'zod'
import {
  STUCK_UPDATE_CODE_MAX_LENGTH,
  STUCK_UPDATE_NOTE_MAX_LENGTH,
  STUCK_UPDATE_NOTE_MIN_LENGTH,
  StuckTransactionOutcome
} from '@type/stuckTransaction.type'

const requiredCode = (label: string) =>
  z
    .string()
    .trim()
    .max(
      STUCK_UPDATE_CODE_MAX_LENGTH,
      `${label} tối đa ${STUCK_UPDATE_CODE_MAX_LENGTH} ký tự`
    )

/**
 * Form chốt kết quả giao dịch treo.
 *
 * `authCode` và `settlementId` chỉ bắt buộc khi chốt **Thành công** — đó là ràng
 * buộc của BE, và cũng là điều đúng về nghiệp vụ: chốt thất bại thì không có mã
 * chuẩn chi nào để nhập.
 */
export const stuckTransactionUpdateSchema = z
  .object({
    newStatus: z.enum(
      [StuckTransactionOutcome.POSTED, StuckTransactionOutcome.FAILED],
      'Vui lòng chọn kết quả cuối của giao dịch'
    ),
    authCode: requiredCode('Mã chuẩn chi'),
    settlementId: requiredCode('Mã đối soát'),
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
  .superRefine((values, ctx) => {
    if (values.newStatus !== StuckTransactionOutcome.POSTED) return

    if (!values.authCode) {
      ctx.addIssue({
        code: 'custom',
        path: ['authCode'],
        message: 'Chốt thành công bắt buộc có mã chuẩn chi'
      })
    }
    if (!values.settlementId) {
      ctx.addIssue({
        code: 'custom',
        path: ['settlementId'],
        message: 'Chốt thành công bắt buộc có mã đối soát'
      })
    }
  })

export type StuckTransactionUpdateFormValues = z.infer<
  typeof stuckTransactionUpdateSchema
>
