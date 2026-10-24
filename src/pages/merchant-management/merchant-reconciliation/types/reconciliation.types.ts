export type ReconciliationTrigger = 'DAILY' | 'ON_DEMAND' | 'RECHECK'
export type ReconciliationOutcome = 'BALANCED' | 'MISMATCH' | 'UNAVAILABLE'

export type EquationCode =
  | 'AVAILABLE'
  | 'RULE_HOLD'
  | 'ORDER_FREEZE'
  | 'WITHDRAWAL_IN_PROCESS'
  | 'ESCROW_WAITING'
  | 'FROZEN_TOTAL'
  | 'ITEM_COMPOSITION'
  | 'PAYOUT_CEILING'
  | 'UNIQUE_KEYS'

/** Phương trình 1-6 là tiền (đồng); 7-9 là số lượng vi phạm. */
export interface ReconciliationEquation {
  no: number
  code: EquationCode
  label: string
  ledger: number
  detail: number
  difference: number
  ok: boolean
}

export interface ReconciliationResult {
  id: string
  masterId: string
  subMerchantId: string
  businessDate: string
  runNo: number
  trigger: ReconciliationTrigger
  result: ReconciliationOutcome
  equations: ReconciliationEquation[]
  mismatchCount: number
  createdAt: string
}

export interface SettlementPause {
  id: string
  masterId: string
  subMerchantId: string
  resultId: string
  reason: string
  since: string
  escalated: boolean
}

export interface SensitiveOtpConfirmation {
  otpSessionId: string
  otp: string
}

export interface ConfirmHandledBody {
  cause: string
  treatment: string
  sensitiveOtp: SensitiveOtpConfirmation
}

export interface ResultsQuery {
  subId: string
  /** YYYY-MM-DD; bỏ trống để lấy mọi ngày. */
  date?: string
}

export type BalanceLineCode =
  | 'AVAILABLE'
  | 'PENDING_SETTLEMENT'
  | 'RULE_HOLD'
  | 'ORDER_FREEZE'
  | 'WITHDRAWAL_IN_PROCESS'
  | 'WAITING_ESCROW'

export interface BalanceLine {
  code: BalanceLineCode
  label: string
  amount: number
  explanation: string
}

export interface SubBalanceReport {
  subMerchantId: string
  subCode: string
  subName: string
  revenueBalance: number
  availableBalance: number
  pendingSettlement: number
  frozenTotal: number
  available: BalanceLine
  pending: BalanceLine
  ruleHold: BalanceLine
  orderFreeze: BalanceLine
  withdrawalInProcess: BalanceLine
  waitingEscrow: BalanceLine
  asOf: string
}
