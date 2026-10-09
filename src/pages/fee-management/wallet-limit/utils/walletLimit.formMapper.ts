import {
  WalletLimitScope,
  WalletLimitStatus,
  WalletLimitTransactionType,
  type WalletLimitBankOverride,
  type WalletLimitCreateBody,
  type WalletLimitPolicy,
  type WalletLimitPolicyBody,
  type WalletLimitUpdateBody
} from '@type/walletLimit.type'
import type { Path } from 'react-hook-form'
import {
  OUTFLOW_LIMIT_KEYS,
  TRANSACTION_LIMIT_KEYS,
  type LimitFieldKey
} from '../constants/walletLimit.constants'
import type {
  WalletLimitFormValues,
  WalletLimitOverrideValues
} from '../schemas/walletLimitForm.schema'
import { getLimitApplicability } from './walletLimit.rules'

type FormPath = Path<WalletLimitFormValues>
type OverrideKey = keyof WalletLimitOverrideValues
type ApiOverride = WalletLimitPolicyBody['bankOverrides'][number]

const ALL_LIMIT_KEYS: readonly LimitFieldKey[] = [
  ...TRANSACTION_LIMIT_KEYS,
  ...OUTFLOW_LIMIT_KEYS
]
const OVERRIDE_KEYS: readonly OverrideKey[] = [
  'transactionType',
  'bankCode',
  'paymentMethod',
  'minPerTransaction',
  'maxPerTransaction',
  'dailyMaximum',
  'normalMonthlyMaximum',
  'specialMonthlyMaximum'
]
const TOP_LEVEL_FIELDS: readonly FormPath[] = [
  ...ALL_LIMIT_KEYS,
  'scopeType',
  'targetId',
  'transactionType',
  'status'
]

export const toNumberOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const emptyLimits = (): Record<LimitFieldKey, number | null> => ({
  minPerTransaction: null,
  maxPerTransaction: null,
  dailyMaximum: null,
  normalMonthlyMaximum: null,
  specialMonthlyMaximum: null,
  walletBalanceMaximum: null,
  outflowDailyMaximum: null,
  outflowMonthlyMaximum: null,
  outboundMaxTimesPerDay: null,
  approvalThreshold: null
})

export const buildEmptyFormValues = (): WalletLimitFormValues => ({
  scopeType: WalletLimitScope.WALLET,
  targetScope: '',
  targetId: '',
  targetDisplay: '',
  walletType: 'ALL',
  transactionType: WalletLimitTransactionType.WITHDRAWAL,
  status: WalletLimitStatus.ACTIVE,
  rowVersion: null,
  ...emptyLimits(),
  bankOverrides: []
})

export const buildEmptyOverride = (
  transactionType: WalletLimitTransactionType
): WalletLimitOverrideValues => ({
  transactionType:
    transactionType === WalletLimitTransactionType.ALL
      ? WalletLimitTransactionType.WITHDRAWAL
      : transactionType,
  bankCode: '',
  paymentMethod: '',
  minPerTransaction: null,
  maxPerTransaction: null,
  dailyMaximum: null,
  normalMonthlyMaximum: null,
  specialMonthlyMaximum: null
})

const overrideToFormValues = (
  row: WalletLimitBankOverride
): WalletLimitOverrideValues => ({
  ...buildEmptyOverride(row.transactionType),
  bankCode: row.bankCode ?? '',
  paymentMethod: row.paymentMethod ?? '',
  minPerTransaction: toNumberOrNull(row.minPerTransaction),
  maxPerTransaction: toNumberOrNull(row.maxPerTransaction),
  dailyMaximum: toNumberOrNull(row.dailyMaximum),
  normalMonthlyMaximum: toNumberOrNull(row.normalMonthlyMaximum),
  specialMonthlyMaximum: toNumberOrNull(row.specialMonthlyMaximum)
})

const pickLimits = (
  policy: WalletLimitPolicy
): Record<LimitFieldKey, number | null> => {
  const limits = emptyLimits()
  ALL_LIMIT_KEYS.forEach((key) => {
    limits[key] = toNumberOrNull(policy[key])
  })
  return limits
}

export const policyToFormValues = (
  policy: WalletLimitPolicy
): WalletLimitFormValues => ({
  scopeType: policy.scopeType,
  targetScope: policy.scopeType,
  targetId: policy.targetId ?? '',
  targetDisplay: policy.targetDisplay ?? '',
  walletType: policy.walletType,
  transactionType: policy.transactionType,
  status: policy.status,
  rowVersion: policy.rowVersion,
  ...pickLimits(policy),
  bankOverrides: (policy.bankOverrides ?? []).map(overrideToFormValues)
})

/** Cấu hình Hệ thống: các ô đang có số ở bản gốc thì không được để trống. */
export const getSystemRequiredKeys = (
  policy: WalletLimitPolicy
): LimitFieldKey[] =>
  policy.scopeType === WalletLimitScope.SYSTEM
    ? ALL_LIMIT_KEYS.filter((key) => toNumberOrNull(policy[key]) !== null)
    : []

/** Ô không áp dụng cho loại giao dịch này: khóa trên form và gửi `null`. */
export const getInapplicableKeys = (
  transactionType: WalletLimitTransactionType
): LimitFieldKey[] => {
  const rule = getLimitApplicability(transactionType)
  return [
    ...(rule.walletBalance ? [] : (['walletBalanceMaximum'] as const)),
    ...(rule.outflow
      ? []
      : ([
          'outflowDailyMaximum',
          'outflowMonthlyMaximum',
          'outboundMaxTimesPerDay'
        ] as const)),
    ...(rule.approvalThreshold ? [] : (['approvalThreshold'] as const))
  ]
}

const toApiOverride = (row: WalletLimitOverrideValues): ApiOverride => ({
  transactionType: row.transactionType,
  bankCode:
    row.transactionType === WalletLimitTransactionType.TRANSFER || !row.bankCode
      ? null
      : row.bankCode,
  paymentMethod: row.paymentMethod || null,
  minPerTransaction: row.minPerTransaction ?? 0,
  maxPerTransaction: row.maxPerTransaction ?? 0,
  dailyMaximum: row.dailyMaximum ?? 0,
  normalMonthlyMaximum: toNumberOrNull(row.normalMonthlyMaximum),
  specialMonthlyMaximum: toNumberOrNull(row.specialMonthlyMaximum)
})

/** Giá trị đã qua schema: ô bắt buộc luôn có số, ô không áp dụng bị đưa về `null`. */
const toPolicyBody = (values: WalletLimitFormValues): WalletLimitPolicyBody => {
  const inapplicable = new Set<LimitFieldKey>(
    getInapplicableKeys(values.transactionType)
  )
  const optional = (key: LimitFieldKey) =>
    inapplicable.has(key) ? null : toNumberOrNull(values[key])
  return {
    transactionType: values.transactionType,
    minPerTransaction: values.minPerTransaction ?? 0,
    maxPerTransaction: values.maxPerTransaction ?? 0,
    dailyMaximum: optional('dailyMaximum'),
    normalMonthlyMaximum: optional('normalMonthlyMaximum'),
    specialMonthlyMaximum: optional('specialMonthlyMaximum'),
    walletBalanceMaximum: optional('walletBalanceMaximum'),
    outflowDailyMaximum: optional('outflowDailyMaximum'),
    outflowMonthlyMaximum: optional('outflowMonthlyMaximum'),
    outboundMaxTimesPerDay: optional('outboundMaxTimesPerDay'),
    approvalThreshold: optional('approvalThreshold'),
    bankOverrides: values.bankOverrides.map(toApiOverride)
  }
}

export const formValuesToCreateBody = (
  values: WalletLimitFormValues
): WalletLimitCreateBody => ({
  scopeType: values.scopeType,
  targetId:
    values.scopeType === WalletLimitScope.SYSTEM
      ? null
      : values.targetId || null,
  walletType: values.walletType,
  ...toPolicyBody(values)
})

/** `rowVersion` là giá trị đang hiển thị; lệch thì BE trả 409 `19110`. */
export const formValuesToUpdateBody = (
  values: WalletLimitFormValues
): WalletLimitUpdateBody => ({
  ...toPolicyBody(values),
  status: values.status,
  rowVersion: values.rowVersion ?? 0
})

export interface MappedServerErrors {
  errors: { name: FormPath; message: string }[]
  /** Câu lỗi của trường không có ô tương ứng trên form, đưa lên banner. */
  unmapped: string[]
}

const OVERRIDE_PATH = /^bankOverrides\[(\d+)\]\.(\w+)$/

const isOverrideKey = (key: string): key is OverrideKey =>
  OVERRIDE_KEYS.some((item) => item === key)

const isTopLevelField = (key: string): key is FormPath =>
  TOP_LEVEL_FIELDS.some((item) => item === key)

/**
 * Đổi tên trường BE (`dailyMaximum`, `bankOverrides[0].dailyMaximum`) sang tên
 * trường react-hook-form (`bankOverrides.0.dailyMaximum`).
 */
export const mapServerFieldErrors = (
  fields: Record<string, string>
): MappedServerErrors => {
  const result: MappedServerErrors = { errors: [], unmapped: [] }
  Object.entries(fields).forEach(([key, message]) => {
    const match = OVERRIDE_PATH.exec(key)
    if (match && isOverrideKey(match[2])) {
      const name: FormPath = `bankOverrides.${Number(match[1])}.${match[2]}`
      result.errors.push({ name, message })
    } else if (isTopLevelField(key)) {
      result.errors.push({ name: key, message })
    } else {
      result.unmapped.push(message)
    }
  })
  return result
}
