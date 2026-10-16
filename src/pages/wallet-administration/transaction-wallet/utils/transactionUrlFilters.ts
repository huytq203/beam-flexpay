import {
  REFUND_TRANSACTION_TYPE,
  TRANSACTION_FILTER_KEYS,
  type TransactionUrlFilters
} from '../constants/transactionFilter.constants'
import type { FormSearchValues } from '../types/Transaction.type'

/** Lấy đúng các ô lọc lưu trên URL; ô trống bị bỏ để không gửi chuỗi rỗng. */
export const toTransactionUrlFilters = (
  data: Partial<FormSearchValues>
): TransactionUrlFilters => {
  const result: TransactionUrlFilters = {}
  for (const key of TRANSACTION_FILTER_KEYS) {
    const value = data[key]
    if (value) result[key] = value
  }
  return result
}

/**
 * Giá trị hiện lại trên form. "Hoàn tiền" được lưu thành hasRefund=true (không
 * kèm transactionType), nên phải dựng lại lựa chọn REVERSAL cho ô Loại giao dịch.
 */
export const toTransactionFormValues = (
  filters: TransactionUrlFilters
): FormSearchValues => ({
  status: filters.status ?? '',
  fromDate: filters.fromDate ?? '',
  toDate: filters.toDate ?? '',
  transactionType:
    filters.transactionType ??
    (filters.hasRefund === 'true' ? REFUND_TRANSACTION_TYPE : ''),
  senderUsername: filters.senderUsername ?? '',
  receiverUsername: filters.receiverUsername ?? '',
  bankCode: '',
  paymentMethod: filters.paymentMethod ?? '',
  transactionCode: filters.transactionCode ?? '',
  hasRefund: filters.hasRefund ?? '',
  minAmount: undefined,
  maxAmount: undefined
})
