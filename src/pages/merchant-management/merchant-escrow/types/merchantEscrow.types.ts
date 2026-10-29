/**
 * Kiểu dữ liệu màn Ký quỹ Merchant (FR-MER-0625..0629). Tên trường giữ đúng record Java ở
 * `flex.merchant` (origin/develop); `Long`/`Integer` có thể null → `number | null`.
 * Tiền là số nguyên VND; thời điểm là Instant ISO-8601 (UTC); `LocalDate` là `YYYY-MM-DD`.
 */

/** Trạng thái lệnh nạp và lệnh hoàn trả dùng chung một vòng đời. */
export type EscrowOrderStatus =
  | 'PENDING_APPROVAL'
  | 'RETURNED'
  | 'APPROVING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export type EscrowSource = 'BANK_TRANSFER' | 'SUB_REVENUE'
export type EscrowReturnReason =
  'REQUIREMENT_REDUCED' | 'CONTRACT_TERMINATED' | 'AGREEMENT_TO_END' | 'OTHER'
export type EscrowRequirementMode = 'FIXED' | 'AVERAGE_REVENUE'
export type EscrowReviewCycle = 'MONTHLY' | 'QUARTERLY' | 'NONE'
export type EscrowOverdueAction = 'WARN_ONLY' | 'BLOCK_PAYMENTS'
/** `UNKNOWN` chỉ có ở Overview: Wallet Core không trả được số dư. */
export type EscrowState =
  'NOT_CONFIGURED' | 'SHORT' | 'MET' | 'SURPLUS' | 'UNKNOWN'
export type EscrowRisk = 'HIGH' | 'MEDIUM' | 'LOW'
export type EscrowLedgerKind =
  | 'DEPOSIT_TRANSFER'
  | 'DEPOSIT_SUB_REVENUE'
  | 'WITHDRAWAL_SETOFF'
  | 'RETURN'
  | 'TERMINATION_DEDUCTION'
  | 'ADJUSTMENT'
export type EscrowPieceStatus =
  | 'RESERVING'
  | 'RESERVED'
  | 'SETTLING'
  | 'DONE'
  | 'TRANSFER_FAILED'
  | 'RELEASING'
  | 'RELEASED'
  | 'CANCELLED'

/** Một dòng danh sách Master (MerchantEscrowQueryService.Row). */
export interface EscrowRow {
  masterId: string
  code: string
  name: string
  activeSubMerchants: number
  state: EscrowState
  requirementMode: EscrowRequirementMode | null
  requiredAmount: number
  balance: number
  shortfall: number
  surplus: number
  percent: number | null
  risk: EscrowRisk | null
  deadlineAt: string | null
  daysLeft: number | null
  overdue: boolean
  allowTransfer: boolean
  allowSetoff: boolean
  balanceSyncedAt: string | null
  waitingOrders: number
}

/** Một phiên bản cấu hình ký quỹ (MerchantEscrowConfigService.Config). */
export interface EscrowConfig {
  id: string
  masterId: string
  version: number
  approvalStatus: string
  source: string
  requirementMode: EscrowRequirementMode | null
  requiredAmount: number
  revenueDays: number | null
  minAmount: number | null
  maxAmount: number | null
  reviewCycle: EscrowReviewCycle | null
  allowTransfer: boolean
  allowSetoff: boolean
  setoffAcknowledged: boolean
  deadlineDays: number
  reminderDays: number
  overdueAction: EscrowOverdueAction | null
  reducesProtection: boolean
  reason: string | null
  authorId: string | null
  approverId: string | null
  decisionNote: string | null
  decidedAt: string | null
  effectiveFrom: string | null
  deadlineAt: string | null
  createdAt: string
}

/** Tình trạng hiện tại của Master. Khi `state = UNKNOWN` mọi số dư đều null. */
export interface EscrowOverview {
  masterId: string
  masterCode: string
  masterName: string
  current: EscrowConfig | null
  pending: EscrowConfig | null
  state: EscrowState
  requiredAmount: number
  balance: number | null
  shortfall: number | null
  surplus: number | null
  percent: number | null
  deadlineAt: string | null
  daysLeft: number | null
  overdue: boolean
}

/** Thân yêu cầu xem trước/lưu cấu hình (không gồm OTP). */
export interface EscrowConfigRequest {
  expectedVersion: number | null
  requirementMode: EscrowRequirementMode | null
  fixedAmount: number | null
  revenueDays: number | null
  minAmount: number | null
  maxAmount: number | null
  reviewCycle: EscrowReviewCycle | null
  allowTransfer: boolean
  allowSetoff: boolean
  setoffAcknowledged: boolean
  deadlineDays: number
  reminderDays: number
  overdueAction: EscrowOverdueAction | null
  reason: string
}

export interface EscrowConfigChange {
  parameter: string
  oldValue: string | null
  newValue: string | null
  reducesProtection: boolean
}

export interface EscrowConfigPreview {
  requiredAmount: number
  reducesProtection: boolean
  needsApproval: boolean
  changes: EscrowConfigChange[]
  shortfallAfter: number | null
  surplusAfter: number | null
  affectedSubMerchants: number
  setoffWarning: boolean
}

export interface EscrowSaveResult {
  outcome: 'APPLIED' | 'PENDING_APPROVAL'
  version: EscrowConfig
}

export interface EscrowLedgerEntry {
  id: string
  masterId: string
  seq: number
  kind: EscrowLedgerKind
  eventKey: string
  sourceType: string | null
  sourceId: string | null
  amountDelta: number
  balanceAfter: number
  note: string | null
  createdBy: string | null
  occurredAt: string
}

export interface EscrowContributionRow {
  subMerchantId: string | null
  subCode: string | null
  subName: string | null
  amount: number
  byForm: Record<string, number>
}

export interface EscrowVerification {
  continuous: boolean
  breaks: string[]
  balance: number
  contributionTotal: number
  contributionsMatch: boolean
}

/** Chứng từ đính kèm đã tải lên kho tạm (xem `fileRef`). */
export interface EscrowDocumentRef {
  fileRef: string
  fileName: string
  contentType: string
  sizeBytes: number
}

/** Lệnh nạp ký quỹ (MerchantEscrowOrderService.Order). */
export interface EscrowOrder {
  id: string
  orderCode: string
  masterId: string
  source: EscrowSource
  subMerchantId: string | null
  amount: number
  receivingAccountRef: string | null
  transferReference: string | null
  creditedOn: string | null
  note: string | null
  overfundedBy: number
  status: EscrowOrderStatus
  authorId: string | null
  approverId: string | null
  decisionReason: string | null
  decidedAt: string | null
  failureReason: string | null
  reserved: boolean
  stale: boolean
  createdAt: string
  documents: EscrowDocumentRef[]
}

/** Số liệu tính lại khi người duyệt xem và lúc bấm duyệt. */
export interface EscrowOrderImpact {
  requiredAmount: number
  balanceBefore: number | null
  balanceAfter: number | null
  shortfallBefore: number | null
  shortfallAfter: number | null
  surplusAfter: number | null
  subAvailable: number | null
  blockers: string[]
  warnings: string[]
}

export interface EscrowOrderView {
  order: EscrowOrder
  impact: EscrowOrderImpact
}

/** Thân tạo/gửi lại lệnh nạp (không gồm OTP). */
export interface EscrowOrderCreate {
  masterId: string
  source: EscrowSource
  amount: number | null
  receivingAccountRef: string | null
  transferReference: string | null
  creditedOn: string | null
  subMerchantId: string | null
  note: string | null
  documents: EscrowDocumentRef[]
}

export interface EscrowReturnAllocation {
  contributorSubId: string | null
  subCode: string | null
  contribution: number
  ratioPercent: number
  amount: number
  channel: string
}

export interface EscrowReturnCheck {
  code: string
  ok: boolean
  message: string
}

export interface EscrowReturnPlan {
  reason: EscrowReturnReason
  maxAmount: number
  balance: number
  requirement: number
  surplus: boolean
  checks: EscrowReturnCheck[]
  earliestDate: string | null
  lastTransactionDate: string | null
  waitDays: number
  allocations: EscrowReturnAllocation[]
  transferAmount: number
  balanceAfter: number
  requirementDropsToZero: boolean
  blockers: string[]
}

/** Một mảnh hoàn trả theo lô nạp; mảnh `TRANSFER_FAILED` cần Kế toán xử lý. */
export interface EscrowReturnPiece {
  id: string
  contributorSubId: string | null
  fundingLotId: string | null
  amount: number
  channel: string
  status: EscrowPieceStatus
  failureReason: string | null
}

/** Lệnh hoàn trả ký quỹ (MerchantEscrowReturnService.Return). */
export interface EscrowReturn {
  id: string
  returnCode: string
  masterId: string
  reason: EscrowReturnReason
  amount: number
  detail: string | null
  destinationAccountId: string | null
  balanceAtCreation: number
  requirementAtCreation: number
  requiresSenior: boolean
  status: EscrowOrderStatus
  authorId: string | null
  approverId: string | null
  decisionReason: string | null
  decidedAt: string | null
  failureReason: string | null
  stale: boolean
  createdAt: string
  allocations: EscrowReturnAllocation[]
  pieces: EscrowReturnPiece[]
  documents: EscrowDocumentRef[]
}

/** Thân tạo lệnh hoàn trả (không gồm OTP). */
export interface EscrowReturnCreate {
  masterId: string
  reason: EscrowReturnReason
  amount: number | null
  detail: string | null
  destinationAccountId: string | null
  documents: EscrowDocumentRef[]
}

/** Thân gửi lại lệnh hoàn trả: chỉ sửa được chi tiết, tài khoản nhận và chứng từ. */
export interface EscrowReturnResubmit {
  detail: string | null
  destinationAccountId: string | null
  documents: EscrowDocumentRef[]
}
