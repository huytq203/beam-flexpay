import {
  WalletLimitTransactionType,
  type WalletLimitTransactionType as TransactionType
} from '@type/walletLimit.type'

export interface LimitApplicability {
  /** Số dư tối đa của ví: chỉ khi loại giao dịch là Tất cả. */
  walletBalance: boolean
  /** Ba ô chi (ngày, tháng, số lần): không dùng cho Nạp tiền. */
  outflow: boolean
  /** Ngưỡng duyệt lệnh rút: chỉ với Tất cả / Rút tiền. */
  approvalThreshold: boolean
}

export const getLimitApplicability = (
  transactionType: TransactionType
): LimitApplicability => ({
  walletBalance: transactionType === WalletLimitTransactionType.ALL,
  outflow: transactionType !== WalletLimitTransactionType.DEPOSIT,
  approvalThreshold:
    transactionType === WalletLimitTransactionType.ALL ||
    transactionType === WalletLimitTransactionType.WITHDRAWAL
})
