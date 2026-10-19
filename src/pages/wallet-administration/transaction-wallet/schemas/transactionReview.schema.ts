import { z } from 'zod'
import {
  bankConfirmationFieldsSchema,
  validateBankConfirmation
} from '@pages/transaction-management/stuck-transaction/schemas/bankConfirmation.schema'
import { ReviewRejectOption } from '@/app/schemas/transaction-review.schema'
import {
  REVIEW_CODE_MAX,
  REVIEW_NOTE_MAX,
  REVIEW_REASON_MAX
} from '../constants/transactionReview.constant'

const MISSING_RECONCILIATION = 'Vui lòng nhập đầy đủ thông tin đối soát'

const reconciliationCode = (label: string) =>
  z
    .string()
    .trim()
    .max(REVIEW_CODE_MAX, `${label} tối đa ${REVIEW_CODE_MAX} ký tự`)

const requiredCode = (label: string) =>
  reconciliationCode(label).min(1, MISSING_RECONCILIATION)

const reasonField = (emptyMessage: string, rangeMessage: string) =>
  z.string().trim().min(1, emptyMessage).max(REVIEW_REASON_MAX, rangeMessage)

export const markReviewSchema = z.object({
  reason: reasonField(
    'Lý do review là bắt buộc',
    `Lý do review tối đa ${REVIEW_REASON_MAX} ký tự`
  )
})
export type MarkReviewValues = z.infer<typeof markReviewSchema>

/** Bằng chứng ngân hàng chỉ bắt buộc khi `allowedActions[].requiredFields` yêu cầu. */
export const createApproveReviewSchema = (requireBankConfirmation: boolean) =>
  z
    .object({
      authCode: requiredCode('Mã chuẩn chi'),
      settlementId: requiredCode('Mã đối soát'),
      note: z
        .string()
        .trim()
        .max(REVIEW_NOTE_MAX, `Ghi chú tối đa ${REVIEW_NOTE_MAX} ký tự`),
      bankConfirmation: bankConfirmationFieldsSchema.optional()
    })
    .superRefine((values, ctx) => {
      if (!requireBankConfirmation) return
      validateBankConfirmation(
        { newStatus: 'POSTED', bankConfirmation: values.bankConfirmation },
        ctx,
        true
      )
    })
export type ApproveReviewValues = z.infer<
  ReturnType<typeof createApproveReviewSchema>
>

export const createRejectReviewSchema = (requireBankConfirmation: boolean) =>
  z
    .object({
      option: z.enum(ReviewRejectOption, 'Vui lòng chọn hình thức từ chối'),
      reason: reasonField(
        'Nhập lý do gửi khách hàng',
        `Lý do gửi khách hàng tối đa ${REVIEW_REASON_MAX} ký tự`
      ),
      refundAuthCode: reconciliationCode('Mã chuẩn chi (hoàn)'),
      refundSettlementId: reconciliationCode('Mã đối soát (hoàn)'),
      bankConfirmation: bankConfirmationFieldsSchema.optional()
    })
    .superRefine((values, ctx) => {
      if (values.option === ReviewRejectOption.REFUND) {
        for (const field of ['refundAuthCode', 'refundSettlementId'] as const) {
          if (values[field]) continue
          ctx.addIssue({
            code: 'custom',
            path: [field],
            message: MISSING_RECONCILIATION
          })
        }
      }
      if (!requireBankConfirmation) return
      validateBankConfirmation(
        { newStatus: 'FAILED', bankConfirmation: values.bankConfirmation },
        ctx,
        true
      )
    })
export type RejectReviewValues = z.infer<
  ReturnType<typeof createRejectReviewSchema>
>
