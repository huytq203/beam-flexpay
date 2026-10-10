import { z } from 'zod'

/**
 * Trường hoàn tiền BE gắn vào mỗi dòng `/wallet/journal/unified`. Cả bốn đều
 * `nullish`: user-wallet không trả lời thì BE để `null`, và bản deploy cũ chưa
 * có trường nào. `null` nghĩa là "chưa biết", khác hẳn `0` ("không có hoàn tiền").
 */
export const unifiedRefundFieldsSchema = z.object({
  /** Tổng tiền đã hoàn xong. */
  refundedAmount: z.number().nullish(),
  /** Tổng tiền hoàn đang chờ duyệt hoặc đang xử lý. */
  pendingRefundAmount: z.number().nullish(),
  /** Đã từng có yêu cầu hoàn (không tính bị từ chối). */
  refunded: z.boolean().nullish(),
  /** Trạng thái để hiển thị; `FAILED_REFUND` khi lệnh nạp thất bại có bản ghi hoàn. */
  displayStatus: z.string().nullish()
})

export type UnifiedRefundFields = z.infer<typeof unifiedRefundFieldsSchema>
