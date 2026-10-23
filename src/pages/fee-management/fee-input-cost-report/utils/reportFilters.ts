import dayjs from 'dayjs'

export const dateOnly = (value: string | undefined): string =>
  value ? value.slice(0, 10) : ''

/** Mặc định: từ ngày đầu tháng hiện tại đến hôm nay. */
export const defaultReportFilters = (now = dayjs()) => ({
  from: now.startOf('month').format('YYYY-MM-DD'),
  to: now.format('YYYY-MM-DD')
})

const MARGIN_NEGATIVE = 'text-red-600 font-medium'

/** Chênh lệch âm (Beam lỗ) hiện màu cảnh báo. */
export const marginClassName = (margin: number): string | undefined =>
  margin < 0 ? MARGIN_NEGATIVE : undefined
