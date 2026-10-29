/** Các mã paymentMethod backend phí thực sự hỗ trợ. */
export const BACKEND_PAYMENT_METHODS = [
  'LINKED_ACCOUNT',
  'WALLET_BALANCE',
  'BANK_TRANSFER',
  'ATM',
  'CC',
  'VA'
] as const

export type BackendPaymentMethod = (typeof BACKEND_PAYMENT_METHODS)[number]

export interface PaymentMethodOption {
  readonly value: BackendPaymentMethod
  readonly label: string
}

/**
 * Phương thức được phép chọn theo loại giao dịch. Áp dụng cho mọi phương thức thì để
 * ô trống (chuỗi rỗng, bị bỏ khỏi payload), nên danh sách không có mục "Tất cả".
 *
 * Nhãn có chủ đích phụ thuộc ngữ cảnh: cùng mã `ATM` nhưng ở luồng rút là
 * IBFT về thẻ, còn ở thanh toán/hoàn tiền bao gồm ngân hàng liên kết và trực
 * tiếp. Backend nhận mã ở `value`; phần diễn giải chỉ phục vụ người vận hành.
 * QR chưa thuộc enum backend phí nên không được đưa vào danh sách lựa chọn.
 */
export const PAYMENT_METHOD_OPTIONS_BY_SERVICE_TYPE: Readonly<
  Record<string, readonly PaymentMethodOption[]>
> = {
  EWALLET_DEPOSIT: [
    { value: 'ATM', label: 'Thẻ ATM' },
    {
      value: 'LINKED_ACCOUNT',
      label: 'Tài khoản ngân hàng liên kết'
    }
  ],
  EWALLET_WITHDRAWAL: [
    { value: 'ATM', label: 'Thẻ ATM' },
    {
      value: 'LINKED_ACCOUNT',
      label: 'Tài khoản ngân hàng liên kết'
    }
  ],
  EWALLET_TRANSFER_INTERNAL: [{ value: 'WALLET_BALANCE', label: 'Ví điện tử' }],
  EWALLET_TRANSFER_EXTERNAL: [
    { value: 'BANK_TRANSFER', label: 'Tài khoản ngân hàng' }
  ],
  EWALLET_CASHBACK: [
    { value: 'WALLET_BALANCE', label: 'Số dư ví' },
    {
      value: 'ATM',
      label: 'Thẻ ATM'
    },
    {
      value: 'LINKED_ACCOUNT',
      label: 'Tài khoản ngân hàng liên kết'
    },
    {
      value: 'BANK_TRANSFER',
      label: 'Chuyển khoản ngân hàng trực tiếp'
    },
    { value: 'CC', label: 'Thẻ tín dụng/quốc tế' }
  ],
  MERCHANT_VA_BILL_COLLECTION: [
    { value: 'VA', label: 'Tài khoản định danh (VA)' }
  ],
  MERCHANT_DISBURSEMENT: [
    { value: 'BANK_TRANSFER', label: 'Tài khoản ngân hàng' }
  ],
  PAYOUT_BANK_TRANSFER: [
    { value: 'BANK_TRANSFER', label: 'Tài khoản ngân hàng' }
  ]
}

export const getPaymentMethodOptions = (
  serviceType: string | null | undefined
): readonly PaymentMethodOption[] =>
  (serviceType && PAYMENT_METHOD_OPTIONS_BY_SERVICE_TYPE[serviceType]) || []

export const isPaymentMethodAllowed = (
  serviceType: string | null | undefined,
  paymentMethod: string
): boolean =>
  paymentMethod === '' ||
  getPaymentMethodOptions(serviceType).some(
    (option) => option.value === paymentMethod
  )
