/** Chỉ phí xử lý hoàn tiền phân biệt theo loại giao dịch gốc; backend từ chối ở loại giao dịch khác. */
export const ORIGINAL_TYPE_SERVICE_TYPES: readonly string[] = ['EWALLET_REFUND']

export const allowsOriginalTypeCriteria = (
  serviceType: string | null | undefined
): boolean => ORIGINAL_TYPE_SERVICE_TYPES.includes(serviceType ?? '')

/** Loại giao dịch gốc có thể hoàn; cùng giá trị backend nhận ở `originalTransactionType`. */
export const ORIGINAL_TYPE_OPTIONS = [
  { value: 'CASH_IN', label: 'Hoàn nạp tiền' },
  { value: 'CASH_OUT', label: 'Hoàn rút tiền' },
  { value: 'P2P_TRANSFER', label: 'Hoàn chuyển tiền' },
] as const

export const getOriginalTypeLabel = (
  value: string | null | undefined
): string =>
  ORIGINAL_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
  value ??
  ''

export const ORIGINAL_TYPE_HINT =
  'Loại giao dịch được hoàn. Để trống là mọi loại hoàn. Bản gán chọn loại cụ thể được ưu tiên hơn bản gán chỉ chọn ngân hàng.'
