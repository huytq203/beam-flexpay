import type { Dayjs } from 'dayjs'
import type { WalletLimitListParams } from '@type/walletLimit.type'
import type { WalletLimitListFilters } from '../types/walletLimitList.types'

const VIETNAM_OFFSET = '+07:00'

/** Ngày lịch người dùng chọn (không phụ thuộc múi giờ máy) → instant theo giờ VN. */
const toVietnamInstant = (date: Dayjs, time: string): string =>
  new Date(
    `${date.format('YYYY-MM-DD')}T${time}${VIETNAM_OFFSET}`
  ).toISOString()

export const toVietnamDayStartIso = (date: Dayjs): string =>
  toVietnamInstant(date, '00:00:00.000')

export const toVietnamDayEndIso = (date: Dayjs): string =>
  toVietnamInstant(date, '23:59:59.999')

/** Chỉ đưa vào query những giá trị có nghĩa; BE coi tham số vắng mặt là "tất cả". */
export const buildWalletLimitListParams = (
  filters: WalletLimitListFilters,
  page: number,
  size: number
): WalletLimitListParams => {
  const keyword = filters.targetKeyword.trim()

  return {
    page,
    size,
    ...(filters.scopeType ? { scopeType: filters.scopeType } : {}),
    ...(keyword ? { targetKeyword: keyword } : {}),
    ...(filters.transactionType
      ? { transactionType: filters.transactionType }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.bankCode ? { bankCode: filters.bankCode } : {}),
    ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
    ...(filters.createdFrom
      ? { createdFrom: toVietnamDayStartIso(filters.createdFrom) }
      : {}),
    ...(filters.createdTo
      ? { createdTo: toVietnamDayEndIso(filters.createdTo) }
      : {})
  }
}
