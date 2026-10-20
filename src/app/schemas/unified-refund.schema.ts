import { z } from 'zod'

/**
 * Trường hoàn tiền BE gắn vào mỗi dòng `/wallet/journal/unified`. Cả bốn đều
 * `nullish`: user-wallet không trả lời thì BE để `null`, và bản deploy cũ chưa
 * có trường nào. `null` nghĩa là "chưa biết", khác hẳn `0` ("không có hoàn tiền").
 */
/**
 * Một yêu cầu hoàn của giao dịch gốc, wallet-core lấy từ user-wallet. Mã loại/trạng
 * thái để `string` vì đây là dữ liệu chỉ hiển thị: giá trị mới chưa biết vẫn hiện
 * nguyên văn thay vì làm hỏng cả màn chi tiết.
 */
export const refundItemInfoSchema = z.object({
  refundCode: z.string(),
  refundType: z.string(),
  /** Trạng thái thật, dùng cho logic. */
  status: z.string(),
  /** Như `status`, riêng bản ghi Thất bại hoàn tiền là `FAILED_REFUND`. Dùng để hiển thị. */
  displayStatus: z.string(),
  requestedAmount: z.number(),
  netCredit: z.number(),
  /** ISO-8601 không múi giờ, ví dụ `2026-10-18T10:00:00`. */
  createdAt: z.string(),
  approvedAt: z.string().nullish(),
  createdBy: z.string().nullish(),
  rejectedReason: z.string().nullish()
})

export type RefundItemInfo = z.infer<typeof refundItemInfoSchema>

export const unifiedRefundFieldsSchema = z.object({
  /** Tổng tiền đã hoàn xong. */
  refundedAmount: z.number().nullish(),
  /** Tổng tiền hoàn đang chờ duyệt hoặc đang xử lý. */
  pendingRefundAmount: z.number().nullish(),
  /** Đã từng có yêu cầu hoàn (không tính bị từ chối). */
  refunded: z.boolean().nullish(),
  /** Trạng thái để hiển thị; `FAILED_REFUND` khi lệnh nạp thất bại có bản ghi hoàn. */
  displayStatus: z.string().nullish(),
  /**
   * Chỉ có ở `/unified/{id}/detail`, mới nhất trước, gồm cả bị từ chối. `[]` là chưa có
   * yêu cầu hoàn; `null`/vắng là chưa tra được (user-wallet lỗi), KHÔNG phải "chưa hoàn".
   */
  refunds: z.array(refundItemInfoSchema).nullish()
})

export type UnifiedRefundFields = z.infer<typeof unifiedRefundFieldsSchema>
