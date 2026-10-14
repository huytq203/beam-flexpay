import {
  FEE_SCOPES,
  type FeeScope
} from '@pages/fee-management/fee-config/constants/feeConfigFields'

/** Mọi khoá bộ lọc của màn danh sách chính sách phí nằm trên URL. */
export const FILTER_KEYS = [
  'feeScope',
  'keyword',
  'subjectKeyword',
  'status',
  'appliedTarget',
  'direction',
  'serviceType',
  'bankCode',
  'paymentMethod',
  'payerType',
  'beneficiaryType',
  'feeBearer',
  'validFrom',
  'validTo',
  'createdAtFrom',
  'createdAtTo'
] as const

export type FilterKey = (typeof FILTER_KEYS)[number]

export const dateOnly = (value: string | undefined): string | null =>
  value ? value.slice(0, 10) : null

/**
 * Dựng payload cho `applyFilters`: giữ nguyên mọi bộ lọc đang có trên URL (khoá thiếu thành
 * `null` để xoá khỏi URL) rồi ghi đè bằng `overrides`. Mọi khoá của màn hình đều đi qua đây nên
 * thêm một bộ lọc mới chỉ cần thêm vào `FILTER_KEYS`.
 */
export const keepFilters = (
  current: Partial<Record<FilterKey, string | undefined>>,
  overrides: Partial<Record<FilterKey, string | null | undefined>> = {}
): Record<FilterKey, string | null> =>
  Object.fromEntries(
    FILTER_KEYS.map((key) => [
      key,
      key in overrides ? (overrides[key] ?? null) : (current[key] ?? null)
    ])
  ) as Record<FilterKey, string | null>

export const isFeeScope = (value: unknown): value is FeeScope =>
  FEE_SCOPES.some((scope) => scope === value)
