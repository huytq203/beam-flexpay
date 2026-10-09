import type { FeeEffectiveStatus } from '@/app/schemas/applicable-fee-rule.schema'
import { EFFECTIVE_STATUS_CONFIG, POLICY_STATUS_CONFIG } from '@constants/feeLabels'

/**
 * Bộ lọc "Trạng thái" gộp vòng đời duyệt và thời hạn hiệu lực vào một ô chọn.
 * Giá trị PENDING/ACTIVE/EXPIRED là trạng thái hiệu lực của chính sách đã duyệt
 * và đang bật; các giá trị còn lại là `status` thô của backend.
 */
const EFFECTIVE_VALUES: readonly string[] = ['PENDING', 'ACTIVE', 'EXPIRED']

export interface PolicyStatusFilterParams {
  status?: string
  effectiveStatus?: FeeEffectiveStatus
}

export const splitPolicyStatusFilter = (
  value: string | undefined
): PolicyStatusFilterParams => {
  if (!value) return {}
  return EFFECTIVE_VALUES.includes(value)
    ? { effectiveStatus: value as FeeEffectiveStatus }
    : { status: value }
}

export const POLICY_STATUS_FILTER_OPTIONS = [
  { value: 'INIT', label: POLICY_STATUS_CONFIG.INIT.label },
  { value: 'REJECTED', label: POLICY_STATUS_CONFIG.REJECTED.label },
  { value: 'PENDING', label: EFFECTIVE_STATUS_CONFIG.PENDING.label },
  { value: 'ACTIVE', label: EFFECTIVE_STATUS_CONFIG.ACTIVE.label },
  { value: 'EXPIRED', label: EFFECTIVE_STATUS_CONFIG.EXPIRED.label },
  { value: 'INACTIVE', label: POLICY_STATUS_CONFIG.INACTIVE.label },
  { value: 'LOCKED', label: POLICY_STATUS_CONFIG.LOCKED.label }
]
