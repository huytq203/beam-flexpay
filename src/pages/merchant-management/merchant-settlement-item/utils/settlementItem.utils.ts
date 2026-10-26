import dayjs from 'dayjs'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  SETTLEMENT_FILTER_MESSAGES,
  type SettlementFilterKey
} from '../constants/settlementItem.constants'
import type {
  SettlementItemFilterError,
  SettlementItemFilters,
  SettlementItemQuery
} from '../types/settlementItem.types'

const DATE_FORMAT = 'YYYY-MM-DD'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const isValidDate = (value?: string): value is string =>
  !!value && DATE_PATTERN.test(value) && dayjs(value, DATE_FORMAT).isValid()

export const toDateString = (value: dayjs.Dayjs): string =>
  value.format(DATE_FORMAT)

export const fromDateString = (value?: string): dayjs.Dayjs | null =>
  isValidDate(value) ? dayjs(value, DATE_FORMAT) : null

/**
 * BE trả 500 khi thiếu hoặc sai kiểu tham số, nên FE phải tự chặn: cần Sub, đủ
 * hai ngày đúng định dạng và `paidTo` không trước `paidFrom`.
 */
export const validateSettlementFilters = (
  filters: SettlementItemFilters
): SettlementItemFilterError | undefined => {
  if (!filters.subMerchantId) return 'sub'
  if (!isValidDate(filters.paidFrom) || !isValidDate(filters.paidTo))
    return 'dates'
  return filters.paidTo < filters.paidFrom ? 'range' : undefined
}

export const describeFilterError = (error: SettlementItemFilterError): string =>
  SETTLEMENT_FILTER_MESSAGES[error]

/** Chỉ trả về truy vấn khi bộ lọc đủ và hợp lệ; ngược lại không được gọi API. */
export const toSettlementQuery = (
  filters: SettlementItemFilters
): SettlementItemQuery | undefined =>
  validateSettlementFilters(filters)
    ? undefined
    : {
        subMerchantId: filters.subMerchantId as string,
        paidFrom: filters.paidFrom as string,
        paidTo: filters.paidTo as string
      }

type Raw = Partial<Record<SettlementFilterKey, string>>

export const fromSettlementUrlFilters = (raw: Raw): SettlementItemFilters => ({
  subMerchantId: raw.subMerchantId,
  paidFrom: raw.paidFrom,
  paidTo: raw.paidTo
})

export const toSettlementUrlFilters = (
  filters: SettlementItemFilters
): Record<SettlementFilterKey, string | undefined> => ({
  subMerchantId: filters.subMerchantId,
  paidFrom: filters.paidFrom,
  paidTo: filters.paidTo
})

/** `message` của BE là tên mã lỗi; rẽ nhánh theo đó, không theo câu `detail`. */
export const getSettlementErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object' || !('data' in error))
    return undefined
  const { data } = error
  if (!data || typeof data !== 'object' || !('message' in data))
    return undefined
  return typeof data.message === 'string' ? data.message : undefined
}

export type SettlementErrorTarget = 'list' | 'totals' | 'detail'

const ERROR_FALLBACKS: Record<SettlementErrorTarget, string> = {
  list: 'Không thể tải danh sách mục quyết toán.',
  totals: 'Không thể tải dòng tổng.',
  detail: 'Không thể tải chi tiết mục quyết toán.'
}

export const describeSettlementError = (
  error: unknown,
  target: SettlementErrorTarget
): string => {
  const fallback = ERROR_FALLBACKS[target]
  switch (getSettlementErrorCode(error)) {
    case 'RESOURCE_NOT_FOUND':
      return target !== 'detail'
        ? 'Sub-merchant không tồn tại hoặc nằm ngoài phạm vi được gán cho bạn.'
        : 'Mục quyết toán không tồn tại hoặc nằm ngoài phạm vi được gán cho bạn.'
    case 'FORBIDDEN':
      return 'Bạn không có quyền xem mục quyết toán.'
    case 'INTERNAL_SERVER_ERROR':
      return fallback
    default:
      return getApiErrorDetail(error, fallback)
  }
}

export const formatSnapshotValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
