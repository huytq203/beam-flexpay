import { POLICY_KIND, type PolicyKind } from './feeConfigFields'

/**
 * Loại giao dịch tạm ẩn khỏi ô chọn theo từng màn. Chỉ ẩn giao diện: chính sách đã có vẫn đọc và
 * sửa bình thường vì loại đang chọn luôn được giữ lại trong danh sách.
 */
export const HIDDEN_SERVICE_TYPES_BY_POLICY_KIND: Readonly<
  Record<PolicyKind, readonly string[]>
> = {
  [POLICY_KIND.CUSTOMER_FEE]: ['EWALLET_REFUND'],
  [POLICY_KIND.INPUT_COST]: ['EWALLET_TRANSFER_INTERNAL', 'EWALLET_REFUND']
}
