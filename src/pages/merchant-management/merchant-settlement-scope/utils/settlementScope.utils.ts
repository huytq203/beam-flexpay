import { SCOPE_ERROR_MESSAGE } from '../constants/settlementScope.constants'
import type { ScopeConfigForm } from '../schemas/scopeConfig.schema'
import type {
  HistoryRow,
  HistoryRowRaw,
  HistorySnapshot,
  RemovalPreview,
  ScopeConfigView,
  ScopeUpdateBody
} from '../types/settlementScope.types'

export const EMPTY_SCOPE_FORM: ScopeConfigForm = {
  settlementMode: 'MANUAL_ONLY',
  autoFrequency: 'DAILY',
  holdbackDays: 0,
  holdReason: '',
  active: true,
  reason: ''
}

export const toScopeForm = (view: ScopeConfigView): ScopeConfigForm => ({
  settlementMode: view.settlementMode.value ?? 'MANUAL_ONLY',
  autoFrequency: view.autoFrequency.value ?? 'DAILY',
  holdbackDays: view.holdbackDays.value ?? 0,
  holdReason: view.holdReason.value ?? '',
  active: view.active,
  reason: ''
})

/**
 * Chỉ gửi trường người dùng đổi hoặc trường Master đã tự đặt: gửi thừa sẽ "ghim"
 * giá trị đang kế thừa thành giá trị riêng. Luôn dùng enum canonical (không alias AUTO_T*).
 */
export const buildScopeBody = (
  values: ScopeConfigForm,
  view: ScopeConfigView,
  isSystem: boolean
): ScopeUpdateBody => {
  const body: ScopeUpdateBody = { reason: values.reason.trim() }
  if (isSystem) {
    // Hệ thống luôn có đủ giá trị; cả ba trường đều là giá trị mới tường minh.
    body.settlementMode = values.settlementMode
    body.autoFrequency = values.autoFrequency
    body.holdbackDays = values.holdbackDays
    return body
  }
  const initial = toScopeForm(view)
  const keep = (field: 'settlementMode' | 'autoFrequency' | 'holdbackDays') =>
    values[field] !== initial[field] || view[field].source === view.level
  if (keep('settlementMode')) body.settlementMode = values.settlementMode
  if (values.settlementMode === 'AUTOMATIC' && keep('autoFrequency'))
    body.autoFrequency = values.autoFrequency
  if (keep('holdbackDays')) body.holdbackDays = values.holdbackDays
  if (values.settlementMode === 'HOLD')
    body.holdReason = values.holdReason.trim()
  if (values.active !== initial.active) body.active = values.active
  return body
}

/** Khớp `loosens()` của BE: rút ngắn T+N hoặc chuyển sang AUTOMATIC. */
export const isLoosening = (
  values: ScopeConfigForm,
  view: ScopeConfigView
): boolean => {
  const currentDays = view.holdbackDays.value
  const toAutomatic =
    values.settlementMode === 'AUTOMATIC' &&
    view.settlementMode.value !== 'AUTOMATIC'
  const shorter = currentDays != null && values.holdbackDays < currentDays
  return toAutomatic || shorter
}

/** Gỡ khối riêng là nới lỏng nếu Hệ thống tự động hơn hoặc T+N ngắn hơn (preview không báo trước 403). */
export const removalNeedsApprover = ({
  current,
  afterRemoval
}: RemovalPreview): boolean => {
  const toAutomatic =
    afterRemoval.settlementMode.value === 'AUTOMATIC' &&
    current.settlementMode.value !== 'AUTOMATIC'
  const currentDays = current.holdbackDays.value
  const afterDays = afterRemoval.holdbackDays.value
  const shorter =
    currentDays != null && afterDays != null && afterDays < currentDays
  return toAutomatic || shorter
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseSnapshot = (
  raw: unknown
): { snapshot: HistorySnapshot | null; corrupted: boolean } => {
  if (raw == null || raw === '') return { snapshot: null, corrupted: false }
  if (isRecord(raw))
    return { snapshot: raw as HistorySnapshot, corrupted: false }
  if (typeof raw !== 'string') return { snapshot: null, corrupted: true }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isRecord(parsed))
      return { snapshot: parsed as HistorySnapshot, corrupted: false }
    return { snapshot: null, corrupted: parsed !== null }
  } catch {
    return { snapshot: null, corrupted: true }
  }
}

export const toHistoryRow = (raw: HistoryRowRaw): HistoryRow => ({
  id: raw.id,
  level: raw.level,
  targetId: raw.target_id ?? null,
  changedAt: raw.changed_at ?? null,
  changedBy: raw.changed_by ?? null,
  reason: raw.reason ?? null,
  ...parseSnapshot(raw.snapshot)
})

/** Giữ nguyên thứ tự BE trả (mới nhất trước). */
export const toHistoryRows = (raws: HistoryRowRaw[] = []): HistoryRow[] =>
  raws.map(toHistoryRow)

const SNAPSHOT_KEYS = [
  'settlementMode',
  'autoFrequency',
  'holdbackDays',
  'holdReason',
  'active'
] as const

export interface SnapshotChange {
  key: (typeof SNAPSHOT_KEYS)[number]
  before: unknown
  after: unknown
}

/** `previous` là dòng cũ hơn liền kề; không có (dòng đầu) thì coi như chưa có cấu hình riêng. */
export const diffSnapshot = (
  previous: HistorySnapshot | null,
  next: HistorySnapshot | null
): SnapshotChange[] =>
  SNAPSHOT_KEYS.flatMap((key) => {
    const before = previous?.[key]
    const after = next?.[key]
    return before === after ? [] : [{ key, before, after }]
  })

/** Thời điểm gửi lên BE là UTC dạng `...Z`. */
export const toAtParam = (date: Date): string => date.toISOString()

export const getScopeErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (!error || typeof error !== 'object' || !('data' in error)) return fallback
  const data = error.data
  if (!isRecord(data)) return fallback
  const message = typeof data.message === 'string' ? data.message : ''
  if (message === 'VALIDATION_ERROR' && isRecord(data.data)) {
    const first = Object.values(data.data).find((v) => typeof v === 'string')
    if (typeof first === 'string') return first
  }
  if (SCOPE_ERROR_MESSAGE[message]) return SCOPE_ERROR_MESSAGE[message]
  const detail = data.detail
  return typeof detail === 'string' && detail.trim() ? detail : fallback
}
