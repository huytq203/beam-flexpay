export type SettlementMode = 'MANUAL_ONLY' | 'AUTOMATIC' | 'HOLD'
export type AutoFrequency = 'DAILY' | 'EVERY_2_DAYS' | 'WEEKLY' | 'MONTHLY'

/** Giá trị hiệu lực sau kế thừa, kèm cấp đã đặt ra nó. */
export interface InheritedField<T> {
  value?: T | null
  source?: string
  inherited?: boolean
  suspended?: boolean
}

export interface SettlementConfigDto {
  subMerchantId: string
  configuredAtThisLevel?: boolean
  active?: boolean
  settlementMode: InheritedField<SettlementMode>
  autoFrequency: InheritedField<AutoFrequency>
  holdReason?: InheritedField<string>
  holdbackDays: InheritedField<number>
  autoApprovalThreshold?: InheritedField<number>
  minimumWithdrawalAmount?: InheritedField<number>
  dailyWithdrawalLimit?: InheritedField<number>
  modeChangeWarning?: string | null
  /** Có giá trị khi đã có đề xuất nới lỏng chờ duyệt; các giá trị trên vẫn là bản đang hiệu lực. */
  pendingChangeId?: string | null
}

export interface SettlementChangeDto {
  id: string
  subMerchantId: string
  proposedRequest: Record<string, unknown>
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  authorId?: string
  reason?: string
  approverId?: string | null
  decidedAt?: string | null
  decisionNote?: string | null
  createdAt?: string
}
