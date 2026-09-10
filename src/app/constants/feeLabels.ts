import type { FeeEffectiveStatus } from '@/app/schemas/applicable-fee-rule.schema'

/**
 * Nhãn tiếng Việt cho các mã của module Phí. Dùng chung giữa màn quản trị phí
 * và tab cấu hình phí trong chi tiết ví — đổi nhãn chỉ sửa ở đây.
 */
export const SERVICE_TYPE_LABELS: Readonly<Record<string, string>> = {
  EWALLET_DEPOSIT: 'Nạp tiền ví',
  EWALLET_WITHDRAWAL: 'Rút tiền ví',
  EWALLET_TRANSFER_INTERNAL: 'Chuyển tiền nội bộ',
  EWALLET_TRANSFER_EXTERNAL: 'Chuyển tiền liên ngân hàng',
  EWALLET_CASHBACK: 'Hoàn tiền',
  MERCHANT_VA_BILL_COLLECTION: 'Thu hộ VA',
  PAYOUT_BANK_TRANSFER: 'Chi hộ chuyển khoản ngân hàng'
}

export const PAYMENT_METHOD_LABELS: Readonly<Record<string, string>> = {
  ATM: 'ATM',
  CC: 'Thẻ tín dụng',
  CREDIT_CARD: 'Thẻ tín dụng',
  QR_CODE: 'Quét mã QR',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  LINKED_ACCOUNT: 'Tài khoản liên kết',
  WALLET_BALANCE: 'Tài khoản ví',
  VA: 'Tài khoản ảo'
}

export const CARD_TYPE_LABELS: Readonly<Record<string, string>> = {
  DOMESTIC: 'Nội địa',
  INTERNATIONAL: 'Quốc tế'
}

export const COMPONENT_TYPE_LABELS: Readonly<Record<string, string>> = {
  TRANSACTION_FEE: 'Phí giao dịch cơ bản',
  SYSTEM_FEE: 'Phí hệ thống',
  MERCHANT_FEE: 'Phí merchant',
  BANK_FEE: 'Phí nhà cung cấp đối tác/bank',
  PLATFORM_FEE: 'Phí nền tảng',
  VAT: 'Thuế VAT',
  SERVICE_FEE: 'Phí dịch vụ',
  PROCESSING_FEE: 'Phí xử lý',
  REFUND_FEE: 'Phí hoàn tiền'
}

/** Miền phí — cũng là trục đối soát: ai là bên được hưởng khoản phí. */
export const FEE_DOMAIN_LABELS: Readonly<Record<string, string>> = {
  BANK: 'Ngân hàng',
  EWALLET: 'Ví điện tử',
  MERCHANT: 'Merchant'
}

export const EFFECTIVE_STATUS_CONFIG: Record<
  FeeEffectiveStatus,
  { label: string; className: string }
> = {
  PENDING: { label: 'Chờ áp dụng', className: 'warning-status' },
  ACTIVE: { label: 'Đang áp dụng', className: 'success-status' },
  EXPIRED: { label: 'Hết hạn', className: 'danger-status' }
}

export const getFeeLabel = (
  value: string | null | undefined,
  labels: Readonly<Record<string, string>>,
  emptyLabel = 'Tất cả'
): string => (value ? labels[value] ?? value : emptyLabel)
