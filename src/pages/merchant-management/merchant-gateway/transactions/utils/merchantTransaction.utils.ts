import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { MERCHANT_TRANSACTION_SOURCE_DOMAIN } from '../constants/merchantTransaction.constants'
import type {
  MerchantTransactionFilters,
  MerchantTransactionParams
} from '../types/merchantTransaction.types'

dayjs.extend(utc)

// BE nhận LocalDateTime theo UTC, còn người dùng chọn ngày theo giờ máy.
const toUtcDateTime = (value: dayjs.Dayjs): string =>
  value.utc().format('YYYY-MM-DDTHH:mm:ss')

/** `partyId` là id merchant: flex.merchant đặt merchant ở vai `initiatorId`. */
export const buildMerchantTransactionParams = (
  filters: MerchantTransactionFilters,
  page: number,
  size: number
): MerchantTransactionParams => {
  const keyword = filters.keyword.trim()

  return {
    page,
    size,
    sourceDomain: MERCHANT_TRANSACTION_SOURCE_DOMAIN,
    includeSummary: true,
    partyId: filters.merchant?.id,
    keyword: keyword || undefined,
    transactionType: filters.transactionType,
    status: filters.status,
    fromDate: filters.fromDate
      ? toUtcDateTime(filters.fromDate.startOf('day'))
      : undefined,
    toDate: filters.toDate
      ? toUtcDateTime(filters.toDate.endOf('day'))
      : undefined
  }
}

export const getRowNumber = (
  page: number,
  size: number,
  index: number
): number => (page - 1) * size + index + 1
