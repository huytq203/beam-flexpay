import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  MERCHANT_TRANSACTION_SOURCE_DOMAIN,
  type MerchantTransactionFilterKey
} from '../constants/merchantTransaction.constants'
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

type UrlFilters = Partial<Record<MerchantTransactionFilterKey, string>>

const URL_DATE_FORMAT = 'YYYY-MM-DD'

const parseUrlDate = (value?: string): dayjs.Dayjs | undefined => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = dayjs(value)
  return date.isValid() ? date : undefined
}

export const fromUrlFilters = (
  raw: UrlFilters
): MerchantTransactionFilters => ({
  merchant: raw.merchantId
    ? {
        id: raw.merchantId,
        code: raw.merchantCode ?? '',
        name: raw.merchantName ?? raw.merchantId
      }
    : undefined,
  keyword: raw.keyword ?? '',
  transactionType: raw.transactionType,
  status: raw.status,
  fromDate: parseUrlDate(raw.fromDate),
  toDate: parseUrlDate(raw.toDate)
})

export const toUrlFilters = (
  filters: MerchantTransactionFilters
): UrlFilters => ({
  merchantId: filters.merchant?.id,
  merchantCode: filters.merchant?.code,
  merchantName: filters.merchant?.name,
  keyword: filters.keyword.trim(),
  transactionType: filters.transactionType,
  status: filters.status,
  fromDate: filters.fromDate?.format(URL_DATE_FORMAT),
  toDate: filters.toDate?.format(URL_DATE_FORMAT)
})

export const getRowNumber = (
  page: number,
  size: number,
  index: number
): number => (page - 1) * size + index + 1
