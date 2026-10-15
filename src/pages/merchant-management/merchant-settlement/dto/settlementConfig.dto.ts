import type { SettlementConfigForm } from '../schemas/settlementConfig.schema'
import type {
  AutoFrequency,
  SettlementConfigDto,
  SettlementMode
} from '../types/settlementConfig.types'

/** Không có ba trường hạn mức rút: BE từ chối (1005), hạn mức đi qua màn Hạn mức rút. */
export interface SettlementUpdateBody {
  inherit?: true
  settlementMode?: SettlementMode
  autoFrequency?: AutoFrequency
  holdReason?: string
  holdbackDays?: number
  active?: boolean
  reason: string
}

export const toSettlementConfigForm = (
  dto: SettlementConfigDto
): SettlementConfigForm => ({
  inherit: !dto.configuredAtThisLevel,
  settlementMode: dto.settlementMode.value ?? 'MANUAL_ONLY',
  autoFrequency: dto.autoFrequency.value ?? 'DAILY',
  holdbackDays: dto.holdbackDays.value ?? 0,
  holdReason: dto.holdReason?.value ?? '',
  active: dto.active ?? true,
  reason: ''
})

export const toUpdateBody = (
  form: SettlementConfigForm
): SettlementUpdateBody => {
  const reason = form.reason.trim()
  if (form.inherit) return { inherit: true, reason }
  return {
    settlementMode: form.settlementMode,
    ...(form.settlementMode === 'AUTOMATIC'
      ? { autoFrequency: form.autoFrequency }
      : {}),
    ...(form.settlementMode === 'HOLD'
      ? { holdReason: form.holdReason.trim() }
      : {}),
    holdbackDays: form.holdbackDays,
    active: form.active,
    reason
  }
}
