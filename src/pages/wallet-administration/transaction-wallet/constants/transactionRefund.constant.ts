import {
  RefundChannel,
  RefundOriginalType
} from '@pages/transaction-management/refund-management/schemas/refund.schema'

/**
 * Kênh hoàn BE khoá cứng theo loại giao dịch gốc: nạp tiền chỉ về đúng tài khoản
 * đã nạp, các loại còn lại về ví. Khoá hộ ở UI để không mở lựa chọn mà BE sẽ từ chối.
 */
export const REFUND_CHANNEL_BY_TYPE: Record<RefundOriginalType, RefundChannel> =
  {
    CASH_IN: RefundChannel.TO_BANK,
    CASH_OUT: RefundChannel.TO_WALLET,
    P2P_TRANSFER: RefundChannel.TO_WALLET,
    MERCHANT_PAYMENT: RefundChannel.TO_WALLET
  }

export const REFUND_CHANNEL_HINT: Record<RefundOriginalType, string> = {
  CASH_IN: 'Hoàn nạp tiền chỉ về đúng tài khoản ngân hàng đã nạp.',
  P2P_TRANSFER: 'Hoàn chuyển tiền chỉ về ví của người gửi.',
  CASH_OUT: 'Hoàn rút tiền chỉ về ví, lấy từ quỹ ví tạm giữ.',
  MERCHANT_PAYMENT: 'Hoàn thanh toán merchant về ví khách.'
}

/**
 * BE vẫn đòi đủ 3 trường thụ hưởng khi `channel=TO_BANK` dù bỏ qua giá trị (tài khoản
 * lấy từ lần nạp gốc). UI ẩn ô nhập và gửi giá trị này. CẦN XÁC NHẬN với BE về việc
 * bỏ ràng buộc; chừng nào chưa bỏ thì đây là điểm dễ vỡ nếu BE bắt đầu kiểm định dạng.
 */
export const BENEFICIARY_PLACEHOLDER = {
  beneficiaryBankCode: 'N/A',
  beneficiaryAccountNumber: 'N/A',
  beneficiaryAccountName: 'N/A'
} as const
