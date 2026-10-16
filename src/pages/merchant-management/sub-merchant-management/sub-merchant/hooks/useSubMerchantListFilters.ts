import dayjs from 'dayjs'

import { useUrlFilters } from '@hooks/useUrlFilters'

import {
  SUB_MERCHANT_FILTER_KEYS,
  SUB_MERCHANT_SENSITIVE_KEYS,
  SUB_MERCHANT_STATUSES,
  type SubMerchantFilterKey,
  type SubMerchantFiltersValue
} from '../constants/subMerchantFilters'

type UrlValues = Partial<Record<SubMerchantFilterKey, string>>

const DATE_FORMAT = 'YYYY-MM-DD'

const toDate = (value?: string): string | undefined =>
  value && dayjs(value).isValid() ? dayjs(value).format(DATE_FORMAT) : undefined

// Mã + tên lưu cùng id để hiện lại ô Merchant cha mà không phải gọi thêm API.
const toFiltersValue = (values: UrlValues): SubMerchantFiltersValue => {
  const from = toDate(values.createdFrom)
  const to = toDate(values.createdTo)
  return {
    query: values.query ?? '',
    parentMerchant: values.merchantId
      ? {
          id: values.merchantId,
          code: values.merchantCode ?? '',
          name: values.merchantName ?? values.merchantId
        }
      : undefined,
    status: SUB_MERCHANT_STATUSES.find((status) => status === values.status),
    createdRange: from && to ? [from, to] : undefined
  }
}

const toUrlValues = (value: SubMerchantFiltersValue): UrlValues => {
  const range = value.createdRange || undefined
  return {
    query: value.query.trim(),
    merchantId: value.parentMerchant?.id,
    merchantCode: value.parentMerchant?.code,
    merchantName: value.parentMerchant?.name,
    status: value.status,
    createdFrom: toDate(range?.[0]),
    createdTo: toDate(range?.[1])
  }
}

export const useSubMerchantListFilters = () => {
  const url = useUrlFilters<SubMerchantFilterKey>({
    keys: SUB_MERCHANT_FILTER_KEYS,
    sensitiveKeys: SUB_MERCHANT_SENSITIVE_KEYS
  })

  return {
    filters: toFiltersValue(url.filters),
    page: url.page,
    pageSize: url.size,
    search: (next: SubMerchantFiltersValue): void =>
      url.applyFilters(toUrlValues(next)),
    reset: url.clearFilters,
    // Gọi cả setPage lẫn setPageSize trong cùng một lần đổi sẽ ghi đè lẫn nhau.
    changePage: (next: number, size: number): void => {
      if (size !== url.size) url.setPageSize(size)
      else url.setPage(next)
    }
  }
}
