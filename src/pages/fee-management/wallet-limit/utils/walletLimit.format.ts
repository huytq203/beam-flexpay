import { formatNumber } from '@utils/index'

export const UNLIMITED_LABEL = 'Không giới hạn'

/** Số tiền ghi đủ chữ số, không rút gọn; `null` là không giới hạn chiều đó. */
export const formatLimitMoney = (value: number | null | undefined): string =>
  value == null ? UNLIMITED_LABEL : `${formatNumber(value)} ₫`

export const formatLimitCount = (value: number | null | undefined): string =>
  value == null ? UNLIMITED_LABEL : `${formatNumber(value)} lần`

export const getRowNumber = (page: number, size: number, index: number) =>
  (page - 1) * size + index + 1
