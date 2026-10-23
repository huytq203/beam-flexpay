import type {
  AutoFrequency,
  SettlementMode
} from '../../merchant-settlement/types/settlementConfig.types'

export type ScopeSource =
  | 'SUB'
  | 'MASTER'
  | 'SYSTEM'
  | 'SUSPENDED_SUB'
  | 'SUSPENDED_MASTER'

export interface ScopeField<T> {
  value: T | null
  source: ScopeSource
}

/** View cấp Master hoặc Hệ thống, mỗi trường kèm nguồn. */
export interface ScopeConfigView {
  level: 'MASTER' | 'SYSTEM'
  targetId: string | null
  configuredAtThisLevel: boolean
  active: boolean
  settlementMode: ScopeField<SettlementMode>
  autoFrequency: ScopeField<AutoFrequency>
  holdReason: ScopeField<string>
  holdbackDays: ScopeField<number>
}

export interface RemovalPreview {
  current: ScopeConfigView
  afterRemoval: ScopeConfigView
}

/** Chỉ bốn trường quyết toán; ba trường hạn mức BE từ chối nên không khai báo. */
export interface ScopeUpdateBody {
  settlementMode?: SettlementMode
  autoFrequency?: AutoFrequency
  holdReason?: string
  holdbackDays?: number
  active?: boolean
  reason: string
}

export type HistoryLevel = 'SYSTEM' | 'MASTER' | 'SUB'

/** Dòng lịch sử thô từ BE: snake_case, `snapshot` là chuỗi JSON. */
export interface HistoryRowRaw {
  id: string
  level: HistoryLevel
  target_id: string | null
  changed_at: string | null
  changed_by: string | null
  reason: string | null
  snapshot: string | null
}

export interface HistorySnapshot {
  settlementMode?: SettlementMode
  autoFrequency?: AutoFrequency
  holdReason?: string
  holdbackDays?: number
  active?: boolean
}

export interface HistoryRow {
  id: string
  level: HistoryLevel
  targetId: string | null
  changedAt: string | null
  changedBy: string | null
  reason: string | null
  /** `null` = không còn cấu hình riêng (kế thừa), hợp lệ chứ không phải lỗi. */
  snapshot: HistorySnapshot | null
  /** `true` khi `snapshot` là chuỗi nhưng không parse được. */
  corrupted: boolean
}

export interface EffectiveAtDto {
  subMerchantId: string
  at: string
  fields: {
    settlementMode: ScopeField<SettlementMode>
    autoFrequency: ScopeField<AutoFrequency>
    holdReason: ScopeField<string>
    holdbackDays: ScopeField<number>
  }
  earliestRecordAt?: string | null
}

export interface HistoryQuery {
  level: HistoryLevel
  targetId?: string
}
