export type LimitLevel = 'SYSTEM' | 'MASTER' | 'SUB'
export type LimitApproval =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'INACTIVE'

export interface WithdrawalLimitConfig {
  minimumWithdrawalAmount?: number
  maximumWithdrawalAmount?: number
  dailyWithdrawalLimit?: number
  autoApprovalThreshold?: number
  /** Số lệnh rút tối đa mỗi ngày; vắng mặt nghĩa là không giới hạn. */
  maximumDailyWithdrawalCount?: number
}

export interface LimitChangeDto {
  id: string
  policyDomain: string
  targetLevel: LimitLevel | 'TERMINAL'
  targetId?: string | null
  version: number
  approvalStatus: LimitApproval
  proposedConfig: WithdrawalLimitConfig
  activeFrom: string
  activeUntil?: string | null
  authorId?: string
  approverId?: string | null
  changeReason?: string
  createdAt?: string
  approvedAt?: string | null
}

export interface LimitRequestBody {
  policyDomain: 'WITHDRAWAL'
  targetLevel: LimitLevel
  targetId?: string
  config: WithdrawalLimitConfig
  activeFrom: string
  reason: string
}

export interface LimitHistoryQuery {
  targetLevel: LimitLevel
  targetId?: string
}
