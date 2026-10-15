import {
  RefundChannel,
  RefundOriginalType,
  type RefundTarget
} from '../schemas/refund.schema'

export const getTypeNote = (refund: RefundTarget): string | undefined => {
  if (refund.channel === RefundChannel.TO_BANK) {
    return 'Sau khi duyệt, hệ thống tạo lệnh chi về ngân hàng và chờ ngân hàng xác nhận. Trạng thái chuyển sang Đang xử lý.'
  }
  if (refund.originalType === RefundOriginalType.CASH_OUT) {
    return 'Hoàn giao dịch rút tiền lấy từ quỹ ví tạm giữ. Nếu quỹ không đủ, yêu cầu chuyển sang Chờ đủ số dư.'
  }
  if (refund.originalType === RefundOriginalType.MERCHANT_PAYMENT) {
    return 'Ví merchant phải đủ số dư. Nếu thiếu, hệ thống báo lỗi và yêu cầu vẫn ở Chờ duyệt, không chuyển sang Chờ đủ số dư.'
  }
  return undefined
}
