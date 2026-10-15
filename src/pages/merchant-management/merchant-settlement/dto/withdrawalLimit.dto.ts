import type { WithdrawalLimitForm } from '../schemas/withdrawalLimit.schema'
import type {
  LimitApproval,
  LimitRequestBody,
  WithdrawalLimitConfig
} from '../types/withdrawalLimit.types'

const LIMIT_KEYS = [
  'minimumWithdrawalAmount',
  'maximumWithdrawalAmount',
  'dailyWithdrawalLimit',
  'autoApprovalThreshold',
  'maximumDailyWithdrawalCount'
] as const

export const toLimitRequest = (form: WithdrawalLimitForm): LimitRequestBody => {
  const config: WithdrawalLimitConfig = {}
  for (const key of LIMIT_KEYS) {
    const value = form[key]
    if (value !== undefined) config[key] = value
  }
  return {
    policyDomain: 'WITHDRAWAL',
    targetLevel: form.targetLevel,
    ...(form.targetLevel === 'SYSTEM' ? {} : { targetId: form.targetId }),
    config,
    activeFrom: form.activeFrom,
    reason: form.reason.trim()
  }
}

/** Thông báo thành công của BE là tiếng Anh cố định nên FE tự chọn câu theo `approvalStatus`. */
export const limitOutcomeMessage = (status: LimitApproval): string => {
  if (status === 'APPROVED')
    return 'Thay đổi chỉ làm chặt hơn nên đã được áp dụng ngay.'
  if (status === 'PENDING_APPROVAL')
    return 'Thay đổi làm nới lỏng hạn mức nên đã gửi chờ phê duyệt.'
  return 'Đã ghi nhận thay đổi hạn mức.'
}

/** Ô số để trống phát ra `null`/chuỗi rỗng; schema chỉ nhận `undefined` cho "không đặt". */
export const normalizeLimitForm = (
  values: WithdrawalLimitForm
): WithdrawalLimitForm => {
  const next: WithdrawalLimitForm = { ...values }
  for (const key of LIMIT_KEYS) {
    const value: unknown = next[key]
    if (value === null || value === '' || Number.isNaN(value)) delete next[key]
  }
  return next
}
