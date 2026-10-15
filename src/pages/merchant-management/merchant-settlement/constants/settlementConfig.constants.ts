import type {
  AutoFrequency,
  SettlementMode
} from '../types/settlementConfig.types'

export const MODE_LABEL: Record<SettlementMode, string> = {
  MANUAL_ONLY: 'Thủ công',
  AUTOMATIC: 'Tự động theo chu kỳ',
  HOLD: 'Tạm dừng'
}

export const FREQUENCY_LABEL: Record<AutoFrequency, string> = {
  DAILY: 'Hằng ngày',
  EVERY_2_DAYS: '2 ngày một lần',
  WEEKLY: 'Hằng tuần',
  MONTHLY: 'Hằng tháng'
}

export const SOURCE_LABEL: Record<string, string> = {
  SYSTEM: 'Mặc định hệ thống',
  MASTER: 'Master',
  SUB: 'Sub-merchant'
}

export const MODE_OPTIONS = Object.entries(MODE_LABEL).map(
  ([value, label]) => ({ value, label })
)
export const FREQUENCY_OPTIONS = Object.entries(FREQUENCY_LABEL).map(
  ([value, label]) => ({ value, label })
)
