import { formatVnd } from '../../merchant-settlement/utils/money'
import {
  CALCULATION_MODE_LABEL,
  CAP_MODE_LABEL,
  FIELD_KEYS,
  PAYMENT_METHOD_LABEL
} from '../constants/holdRule.constants'
import type {
  CalculationMode,
  CapMode,
  HoldPaymentMethod,
  HoldRuleChange,
  HoldRuleConfig,
  HoldRuleDisplayStatus,
  HoldRuleKey
} from '../types/holdRule.types'

const MONEY_KEYS: HoldRuleKey[] = [
  'fixedAmount',
  'minimumGrossAmount',
  'capAmount'
]

export const formatPaymentMethods = (
  methods: readonly HoldPaymentMethod[] | null | undefined
): string => {
  if (!methods || methods.length === 0) return 'Tất cả hình thức'
  return [...methods]
    .sort()
    .map((method) => PAYMENT_METHOD_LABEL[method] ?? method)
    .join(', ')
}

/** Định dạng một giá trị tham số để hiển thị; `capBehaviour` giữ nguyên giá trị gốc. */
export const formatHoldRuleValue = (
  key: HoldRuleKey,
  value: unknown
): string => {
  if (value === null || value === undefined) return '—'
  if (key === 'enabled' || key === 'capEnabled') return value ? 'Bật' : 'Tắt'
  if (key === 'paymentMethods')
    return formatPaymentMethods(value as HoldPaymentMethod[])
  if (key === 'calculationMode')
    return CALCULATION_MODE_LABEL[value as CalculationMode] ?? String(value)
  if (key === 'capMode')
    return CAP_MODE_LABEL[value as CapMode] ?? String(value)
  if (typeof value === 'number') {
    if (MONEY_KEYS.includes(key)) return `${formatVnd(value)} đồng`
    if (key === 'ratePercent' || key === 'capPercent') return `${value}%`
    if (key === 'holdDays') return `${value} ngày`
    return String(value)
  }
  return String(value)
}

/** Các khóa có mặt trong `config`, theo thứ tự chuẩn; khóa lạ (nếu có) đứng cuối. */
export const configEntries = (
  config: HoldRuleConfig | null | undefined
): [HoldRuleKey, unknown][] => {
  const source: Record<string, unknown> = { ...(config ?? {}) }
  const known = FIELD_KEYS.filter((key) => source[key] !== undefined)
  const unknown = Object.keys(source).filter(
    (key) => !FIELD_KEYS.includes(key as HoldRuleKey)
  ) as HoldRuleKey[]
  return [...known, ...unknown].map((key) => [key, source[key]])
}

/**
 * `APPROVED` không có trường trạng thái hiệu lực riêng nên suy ra từ
 * `activeFrom`/`activeUntil` so với thời điểm hiện tại.
 */
export const deriveDisplayStatus = (
  row: Pick<HoldRuleChange, 'approvalStatus' | 'activeFrom' | 'activeUntil'>,
  now: number = Date.now()
): HoldRuleDisplayStatus => {
  if (row.approvalStatus === 'PENDING_APPROVAL') return 'PENDING'
  if (row.approvalStatus === 'REJECTED') return 'REJECTED'
  const from = row.activeFrom ? Date.parse(row.activeFrom) : Number.NaN
  if (!Number.isNaN(from) && from > now) return 'SCHEDULED'
  const until = row.activeUntil ? Date.parse(row.activeUntil) : Number.NaN
  if (!Number.isNaN(until) && until <= now) return 'REPLACED'
  return 'ACTIVE'
}

/** `{}` ở Master/Sub nghĩa là "Gỡ quy tắc riêng". */
export const isRemovalConfig = (config: HoldRuleConfig | null | undefined) =>
  configEntries(config).length === 0
