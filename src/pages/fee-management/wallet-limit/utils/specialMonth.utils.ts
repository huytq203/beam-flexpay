import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000
const MONTH_KEY_LENGTH = 7
const YEARS_BEFORE = 1
const YEARS_AFTER = 3

export const ALL_YEARS = 'ALL'

export interface YearOption {
  value: string
  label: string
}

/** Tháng hiện tại theo giờ Việt Nam (UTC+7) dưới dạng `yyyy-MM`. */
export const getCurrentVietnamMonth = (now: Date = new Date()): string => {
  const vietnamTime = new Date(now.getTime() + VIETNAM_OFFSET_MS)
  const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')
  return `${vietnamTime.getUTCFullYear()}-${month}`
}

/** `2027-02-01` -> `2027-02`. */
export const toMonthKey = (monthStart: string): string =>
  monthStart.slice(0, MONTH_KEY_LENGTH)

/** `2027-02-01` -> `02/2027`. */
export const formatMonthLabel = (monthStart: string): string => {
  const [year, month] = toMonthKey(monthStart).split('-')
  return `${month}/${year}`
}

export const isPastMonth = (monthStart: string, now?: Date): boolean =>
  toMonthKey(monthStart) < getCurrentVietnamMonth(now)

export const isCurrentMonth = (monthStart: string, now?: Date): boolean =>
  toMonthKey(monthStart) === getCurrentVietnamMonth(now)

/** Năm hiện tại -1..+3, kèm "Tất cả năm" ở đầu. */
export const getYearOptions = (now?: Date): YearOption[] => {
  const currentYear = Number(getCurrentVietnamMonth(now).slice(0, 4))
  const years = Array.from(
    { length: YEARS_BEFORE + YEARS_AFTER + 1 },
    (_, index) => String(currentYear - YEARS_BEFORE + index)
  )
  return [
    { value: ALL_YEARS, label: 'Tất cả năm' },
    ...years.map((year) => ({ value: year, label: year }))
  ]
}

export const toYearParam = (year: string): { year: number } | undefined =>
  year === ALL_YEARS ? undefined : { year: Number(year) }

/** API trả mảng; sắp tăng dần theo tháng để không phụ thuộc thứ tự BE. */
export const sortSpecialMonths = (
  months: readonly WalletLimitSpecialMonth[]
): WalletLimitSpecialMonth[] =>
  [...months].sort((a, b) => a.monthStart.localeCompare(b.monthStart))
