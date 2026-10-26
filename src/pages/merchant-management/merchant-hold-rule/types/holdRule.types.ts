export type HoldRuleLevel = 'SYSTEM' | 'MASTER' | 'SUB'

export type HoldRuleApproval = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'

export type CalculationMode = 'PERCENT_OF_GROSS' | 'FIXED_PER_TRANSACTION'
export type CapMode = 'FIXED_AMOUNT' | 'PERCENT_OF_30_DAY_REVENUE'
export type CapBehaviour = 'STOP_WHEN_FULL' | 'FILL_TO_CAP'
export type HoldPaymentMethod =
  | 'QR'
  | 'DOMESTIC_CARD'
  | 'INTERNATIONAL_CARD'
  | 'LINKED_WALLET'
  | 'VIRTUAL_ACCOUNT'

/** Đúng 12 khóa BE chấp nhận; khóa vắng = kế thừa cấp trên (không gửi `null`). */
export interface HoldRuleConfig {
  enabled?: boolean
  calculationMode?: CalculationMode
  ratePercent?: number
  fixedAmount?: number
  holdDays?: number
  minimumGrossAmount?: number
  paymentMethods?: HoldPaymentMethod[]
  capEnabled?: boolean
  capMode?: CapMode
  capAmount?: number
  capPercent?: number
  capBehaviour?: CapBehaviour
}

export type HoldRuleKey = keyof HoldRuleConfig

/** Một phiên bản quy tắc (`MerchantLimitConfigChange` với `policyDomain=HOLD_RULE`). */
export interface HoldRuleChange {
  id: string
  policyDomain: string
  targetLevel: HoldRuleLevel
  targetId: string | null
  version: number
  approvalStatus: HoldRuleApproval
  proposedConfig: HoldRuleConfig
  activeFrom: string | null
  activeUntil: string | null
  authorId: string | null
  approverId: string | null
  changeReason: string | null
  createdAt: string | null
  approvedAt: string | null
}

/** Quy tắc đã gộp kế thừa; tham số chưa ai đặt là `null`. */
export interface HoldRulePolicy {
  enabled: boolean
  calculationMode: CalculationMode | null
  ratePercent: number | null
  fixedAmount: number | null
  holdDays: number | null
  minimumGrossAmount: number | null
  paymentMethods: HoldPaymentMethod[] | null
  capEnabled: boolean
  capMode: CapMode | null
  capAmount: number | null
  capPercent: number | null
  capBehaviour: CapBehaviour | null
  /** Chỉ chứa khóa đã được đặt ở một cấp nào đó. */
  sources: Partial<Record<HoldRuleKey, HoldRuleLevel>>
  policyVersionIds: string[]
}

export interface HoldRuleEffectiveQuery {
  masterId?: string
  subMerchantId?: string
}

export interface HoldRuleHistoryQuery {
  targetLevel: HoldRuleLevel
  targetId?: string
}

export interface HoldRuleProposalBody {
  targetLevel: HoldRuleLevel
  targetId?: string
  config: HoldRuleConfig
  activeFrom?: string
  reason: string
}

export interface HoldRuleTarget {
  level: HoldRuleLevel
  targetId?: string
}

/** Trạng thái hiển thị, suy ra từ `approvalStatus` và thời gian hiệu lực. */
export type HoldRuleDisplayStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'REPLACED'
  | 'REJECTED'
