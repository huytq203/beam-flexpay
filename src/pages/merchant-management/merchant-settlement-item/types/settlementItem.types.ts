/** Trạng thái dòng quyết toán: chuỗi do ràng buộc DB, không phải enum Java. */
export type SettlementLineStatus =
  | 'PENDING_SETTLEMENT'
  | 'HELD'
  | 'READY'
  | 'IN_WITHDRAWAL'
  | 'PAID'
  | 'CANCELLED'

export type SettlementLineKind =
  | 'FIRST_TRANCHE'
  | 'HOLD_TRANCHE'
  | 'REFUND'
  | 'FEE_REFUND'

/** Một dòng danh sách; `paidAt`/`holdReleaseAt` là Instant UTC (`Z`). */
export interface SettlementItemRow {
  id: string
  orderId: string
  orderCode: string
  subMerchantId: string
  paidAt: string
  grossAmount: number
  feeAmount: number
  recognisedAmount: number
  firstTrancheAmount: number
  heldAmount: number
  firstTrancheStatus: SettlementLineStatus | null
  firstTrancheWithdrawalId: string | null
  holdTrancheStatus: SettlementLineStatus | null
  holdTrancheWithdrawalId: string | null
  holdReleaseAt: string
}

/** Dòng tổng của toàn bộ khoảng lọc, không phải tổng của trang. */
export interface SettlementItemTotals {
  count: number
  grossAmount: number
  feeAmount: number
  recognisedAmount: number
  firstTrancheAmount: number
  heldAmount: number
}

export interface SettlementItemLine {
  id: string
  kind: SettlementLineKind
  /** Âm với `REFUND`. */
  amount: number
  status: SettlementLineStatus
  withdrawalRequestId: string | null
  updatedAt: string
}

export interface SettlementItemDetail {
  id: string
  orderId: string
  orderCode: string
  masterId: string
  subMerchantId: string
  lotId: string
  paidAt: string
  tnEligibleAt: string
  holdReleaseAt: string
  grossAmount: number
  feeAmount: number
  recognisedAmount: number
  firstTrancheAmount: number
  heldAmount: number
  /** JSON tự do do Wallet Core/Fee engine tạo; không phụ thuộc cấu trúc. */
  feeQuoteSnapshot: Record<string, unknown>
  holdRuleSnapshot: Record<string, unknown>
  lines: SettlementItemLine[]
  grossEqualsFeePlusRecognised: boolean
  recognisedEqualsTranches: boolean
  singleItemForPayment: boolean
}

/** Cả ba tham số đều bắt buộc: thiếu thì BE trả 500. */
export interface SettlementItemQuery {
  subMerchantId: string
  paidFrom: string
  paidTo: string
}

export interface SettlementItemListParams extends SettlementItemQuery {
  page: number
  size: number
}

/** Bộ lọc nháp trên form; ngày dạng `YYYY-MM-DD`. */
export interface SettlementItemFilters {
  subMerchantId?: string
  paidFrom?: string
  paidTo?: string
}

export type SettlementItemFilterError = 'sub' | 'dates' | 'range'
