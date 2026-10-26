export type WalletClosureBlockingCode =
  | 'BALANCE_NOT_ZERO'
  | 'HOLD_NOT_ZERO'
  | 'PENDING_TRANSACTION'
  | 'INVALID_STATUS'
  | 'ALREADY_CLOSED'
  | 'ACCOUNT_CLOSE_INCOMPLETE'

export interface WalletClosureBlockingReason {
  code: WalletClosureBlockingCode | string
  message: string
}

/** GET /admin/user-wallets/{userId}/closure-check */
export interface WalletClosureCheck {
  userId: string
  customerName: string | null
  phoneNumber: string | null
  walletCode: string | null
  walletStatus: string
  balance: number
  holdBalance: number
  availableBalance: number
  currency: string
  eligible: boolean
  /** null: không đọc được trạng thái tài khoản đăng nhập, không suy ra gì. */
  accountClosed: boolean | null
  retryable: boolean
  blockingReasons: WalletClosureBlockingReason[]
}

export interface CloseUserWalletRequest {
  userId: string
  /** Bắt buộc khi ví chưa hủy; bỏ trống ở lượt hoàn tất (retryable). */
  reason?: string
  /** Số nguyên >= 0, gửi dạng số JSON. */
  expectedBalance?: number
}

/** POST /admin/user-wallets/{userId}/close */
export interface CloseUserWalletResult {
  userId: string
  walletStatus: string
  closedAt: string
  closedBy: string
  balanceAtClose: number
  holdBalanceAtClose: number
  accountClosed: boolean
}
