import type { Dayjs } from 'dayjs'
import type {
  WalletLimitPaymentMethod,
  WalletLimitScope,
  WalletLimitStatus,
  WalletLimitTransactionType
} from '@type/walletLimit.type'

/** Bộ lọc nháp (đang nhập) và bộ lọc đang áp có cùng hình dạng. */
export interface WalletLimitListFilters {
  scopeType?: WalletLimitScope
  targetKeyword: string
  transactionType?: WalletLimitTransactionType
  status?: WalletLimitStatus
  bankCode?: string
  paymentMethod?: WalletLimitPaymentMethod
  createdFrom?: Dayjs
  createdTo?: Dayjs
}

export const EMPTY_WALLET_LIMIT_FILTERS: WalletLimitListFilters = {
  targetKeyword: ''
}
