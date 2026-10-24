import {
  CAP_BEHAVIOUR_VALUES,
  FIELD_KEYS,
  FIELD_LABEL,
  MAX_REASON_LENGTH,
  MIN_REASON_LENGTH,
  PAYMENT_METHOD_LABEL
} from '../constants/holdRule.constants'
import type {
  HoldRuleConfig,
  HoldRuleKey,
  HoldRuleLevel,
  HoldRulePolicy,
  HoldRuleProposalBody,
  HoldRuleTarget
} from '../types/holdRule.types'

/** Giá trị đang nhập; `null` là ô số để trống hoặc chưa chọn. */
export type HoldRuleValues = {
  [K in HoldRuleKey]?: HoldRuleConfig[K] | null
}

/**
 * `own` là các tham số cấp này tự đặt (chỉ những khóa này mới được gửi);
 * khóa không nằm trong `own` nghĩa là kế thừa cấp trên.
 */
export interface HoldRuleDraft {
  own: HoldRuleKey[]
  values: HoldRuleValues
}

export type HoldRuleErrors = Partial<Record<HoldRuleKey | 'config', string>>

export const EMPTY_DRAFT: HoldRuleDraft = { own: [], values: {} }

const ENUM_VALUES: Partial<Record<HoldRuleKey, readonly string[]>> = {
  calculationMode: ['PERCENT_OF_GROSS', 'FIXED_PER_TRANSACTION'],
  capMode: ['FIXED_AMOUNT', 'PERCENT_OF_30_DAY_REVENUE'],
  capBehaviour: CAP_BEHAVIOUR_VALUES
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const isInt = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER) =>
  isNumber(value) && Number.isInteger(value) && value >= min && value <= max
const hasAtMost2Decimals = (value: number) =>
  Number.isInteger(Number((value * 100).toFixed(6)))

/** Kiểm tra kiểu và khoảng giá trị một tham số, theo đúng bảng khóa của BE. */
const validateValue = (
  key: HoldRuleKey,
  value: unknown
): string | undefined => {
  if (value === null || value === undefined)
    return key === 'paymentMethods' ? undefined : 'Vui lòng nhập giá trị'
  switch (key) {
    case 'enabled':
    case 'capEnabled':
      return typeof value === 'boolean' ? undefined : 'Chọn Bật hoặc Tắt'
    case 'calculationMode':
    case 'capMode':
    case 'capBehaviour':
      return ENUM_VALUES[key]?.includes(value as string)
        ? undefined
        : 'Giá trị không hợp lệ'
    case 'ratePercent':
      return isNumber(value) &&
        value > 0 &&
        value <= 100 &&
        hasAtMost2Decimals(value)
        ? undefined
        : 'Lớn hơn 0, tối đa 100, tối đa 2 chữ số thập phân'
    case 'capPercent':
      return isNumber(value) &&
        value >= 1 &&
        value <= 100 &&
        hasAtMost2Decimals(value)
        ? undefined
        : 'Từ 1 đến 100, tối đa 2 chữ số thập phân'
    case 'fixedAmount':
    case 'capAmount':
      return isInt(value, 1) ? undefined : 'Số tiền nguyên từ 1 đồng trở lên'
    case 'minimumGrossAmount':
      return isInt(value, 0) ? undefined : 'Số tiền nguyên từ 0 đồng trở lên'
    case 'holdDays':
      return isInt(value, 1, 365) ? undefined : 'Số nguyên từ 1 đến 365 ngày'
    case 'paymentMethods': {
      if (!Array.isArray(value)) return 'Chọn danh sách hình thức'
      const valid = value.every((item) => item in PAYMENT_METHOD_LABEL)
      if (!valid) return 'Hình thức thanh toán không hợp lệ'
      return new Set(value).size === value.length
        ? undefined
        : 'Hình thức thanh toán bị lặp'
    }
  }
}

/** Gom các tham số cấp này tự đặt thành `config` gửi BE (không bao giờ có `null`). */
export const buildConfig = (draft: HoldRuleDraft): HoldRuleConfig => {
  const config: Record<string, unknown> = {}
  for (const key of FIELD_KEYS) {
    if (!draft.own.includes(key)) continue
    const value = draft.values[key]
    if (value === null || value === undefined) {
      // Mảng rỗng = tất cả hình thức; các khóa khác không được gửi null.
      if (key === 'paymentMethods') config[key] = []
      continue
    }
    config[key] = value
  }
  return config as HoldRuleConfig
}

const missingForSystem = (config: HoldRuleConfig): HoldRuleKey[] => {
  const missing: HoldRuleKey[] = []
  const need = (key: HoldRuleKey) => {
    if (config[key] === undefined) missing.push(key)
  }
  if (config.enabled === true) {
    need('calculationMode')
    if (config.calculationMode === 'FIXED_PER_TRANSACTION') need('fixedAmount')
    else need('ratePercent')
    need('holdDays')
  }
  if (config.capEnabled === true) {
    need('capMode')
    if (config.capMode === 'PERCENT_OF_30_DAY_REVENUE') need('capPercent')
    else need('capAmount')
    need('capBehaviour')
  }
  return missing
}

/**
 * Cấp SYSTEM không kế thừa nên kiểm tra được đủ tham số bắt buộc ngay ở FE;
 * Master/Sub phụ thuộc cấp trên nên để BE kiểm tra và hiển thị `detail`.
 */
export const validateDraft = (
  draft: HoldRuleDraft,
  level: HoldRuleLevel
): HoldRuleErrors => {
  const errors: HoldRuleErrors = {}
  for (const key of draft.own) {
    const message = validateValue(key, draft.values[key])
    if (message) errors[key] = message
  }
  if (Object.keys(errors).length > 0) return errors
  if (draft.own.length === 0) {
    errors.config =
      level === 'SYSTEM'
        ? 'Quy tắc mặc định hệ thống không được để trống'
        : 'Chọn ít nhất một tham số cấp này tự đặt, hoặc dùng "Gỡ quy tắc riêng"'
    return errors
  }
  if (level === 'SYSTEM') {
    const missing = missingForSystem(buildConfig(draft))
    if (missing.length > 0)
      errors.config = `Quy tắc đang bật nhưng còn thiếu: ${missing
        .map((key) => FIELD_LABEL[key])
        .join(', ')}`
  }
  return errors
}

export const validateReason = (reason: string): string | undefined => {
  const trimmed = reason.trim()
  if (!trimmed) return 'Vui lòng nhập lý do thay đổi'
  if (trimmed.length < MIN_REASON_LENGTH)
    return `Lý do tối thiểu ${MIN_REASON_LENGTH} ký tự`
  if (trimmed.length > MAX_REASON_LENGTH)
    return `Lý do tối đa ${MAX_REASON_LENGTH} ký tự`
  return undefined
}

const CLOCK_SKEW_MS = 5 * 60 * 1000

/** Ngày chọn theo giờ Việt Nam (00:00 VN) đổi sang `Instant` UTC dạng `...Z`. */
export const toActiveFromInstant = (
  date?: string | null
): string | undefined => {
  if (!date) return undefined
  const instant = new Date(`${date}T00:00:00+07:00`)
  return Number.isNaN(instant.getTime()) ? undefined : instant.toISOString()
}

export const validateActiveFrom = (
  date: string | undefined,
  now: number = Date.now()
): string | undefined => {
  if (!date) return undefined
  const instant = toActiveFromInstant(date)
  if (!instant) return 'Ngày hiệu lực không hợp lệ'
  return Date.parse(instant) < now - CLOCK_SKEW_MS
    ? 'Ngày hiệu lực không được là quá khứ; để trống để áp dụng ngay khi duyệt'
    : undefined
}

export const buildProposalBody = (
  target: HoldRuleTarget,
  config: HoldRuleConfig,
  reason: string,
  activeFromDate?: string
): HoldRuleProposalBody => {
  const activeFrom = toActiveFromInstant(activeFromDate)
  return {
    targetLevel: target.level,
    ...(target.level === 'SYSTEM' ? {} : { targetId: target.targetId }),
    config,
    ...(activeFrom ? { activeFrom } : {}),
    reason: reason.trim()
  }
}

/** Khởi tạo form từ quy tắc đang áp dụng: chỉ khóa do chính cấp này đặt là "tự đặt". */
export const toDraft = (
  policy: HoldRulePolicy | undefined,
  level: HoldRuleLevel
): HoldRuleDraft => {
  if (!policy) return EMPTY_DRAFT
  const source: Record<string, unknown> = { ...policy }
  const own = FIELD_KEYS.filter((key) => policy.sources?.[key] === level)
  const values: Record<string, unknown> = {}
  for (const key of own) values[key] = source[key] ?? null
  return { own, values: values as HoldRuleValues }
}
