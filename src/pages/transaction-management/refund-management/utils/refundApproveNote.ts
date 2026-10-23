import {
  RefundChannel,
  RefundOriginalType,
  type RefundTarget
} from '../schemas/refund.schema'

export const getTypeNote = (refund: RefundTarget): string | undefined => {
  if (refund.channel === RefundChannel.TO_BANK) {
    return 'Sau khi duyệt, hệ thống giữ tiền và tạo lệnh chi về ngân hàng. Trạng thái chuyển sang Chờ duyệt chi; lệnh chi chỉ được gửi sang ngân hàng sau khi Kế toán duyệt chi.'
  }
  if (refund.originalType === RefundOriginalType.CASH_OUT) {
    return 'Hoàn giao dịch rút tiền lấy từ quỹ ví tạm giữ. Nếu quỹ không đủ, yêu cầu chuyển sang Chờ đủ số dư.'
  }

  return undefined
}
