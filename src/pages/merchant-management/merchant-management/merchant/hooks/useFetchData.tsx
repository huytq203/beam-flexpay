import { useUrlFilters } from '@hooks/useUrlFilters'
import { useGetMerchantQuery } from '@services/apiMerchant'
import type { MerchantSearchParams } from '@type/merchant'
import {
  MERCHANT_FILTER_KEYS,
  MERCHANT_SENSITIVE_KEYS,
  toMerchantStatus,
  type MerchantFilterKey
} from '../constants/merchantFilters.constants'

const useFetchData = () => {
  const url = useUrlFilters<MerchantFilterKey>({
    keys: MERCHANT_FILTER_KEYS,
    sensitiveKeys: MERCHANT_SENSITIVE_KEYS
  })
  const { page, size, filters } = url

  const payload: MerchantSearchParams = {
    page,
    size,
    sortDirection: 'DESC',
    sortBy: 'createdAt',
    name: filters.name,
    code: filters.code,
    taxCode: filters.taxCode,
    status: toMerchantStatus(filters.status)
  }
  const {
    data: getMerchantData,
    isLoading: getMerchantLoading,
    isFetching,
    refetch
  } = useGetMerchantQuery(payload)

  const data = getMerchantData?.content?.map((item, index) => ({
    ...item,
    key: item.id,
    stt: (page - 1) * size + index + 1
  }))

  // Gọi cả setPage lẫn setPageSize trong cùng một lần đổi sẽ ghi đè lẫn nhau.
  const changePage = (nextPage: number, nextSize: number): void => {
    if (nextSize !== size) url.setPageSize(nextSize)
    else url.setPage(nextPage)
  }

  return {
    data,
    totalElements: getMerchantData?.totalElements ?? 0,
    page,
    size,
    payload,
    filters,
    changePage,
    applyFilters: url.applyFilters,
    clearFilters: url.clearFilters,
    getMerchantLoading,
    isFetching,
    refetch
  }
}

export default useFetchData
