import { useState } from 'react'
import type { ApiCredential } from '@/app/services/merchantGatewayApi'
import type { PickedEntity } from '@components/index'
import { useUrlFilters } from '@hooks/useUrlFilters'

// Lưu kèm mã + tên Merchant (không nhạy cảm) để hiện lại nhãn bộ lọc khi quay
// lại màn mà không phải gọi thêm API chi tiết.
const KEYS = ['merchantId', 'merchantCode', 'merchantName', 'status'] as const
type KeyConnectionFilterKey = (typeof KEYS)[number]
type Filters = Partial<Record<KeyConnectionFilterKey, string>>

const STATUSES: readonly ApiCredential['status'][] = [
  'ACTIVE',
  'SUSPENDED',
  'REVOKED',
  'EXPIRED'
]

const toStatus = (value?: string): ApiCredential['status'] | undefined =>
  STATUSES.find((item) => item === value)

const toMerchant = (filters: Filters): PickedEntity | undefined =>
  filters.merchantId
    ? {
        id: filters.merchantId,
        code: filters.merchantCode ?? '',
        name: filters.merchantName ?? filters.merchantId
      }
    : undefined

export const useKeyConnectionFilters = () => {
  const url = useUrlFilters<KeyConnectionFilterKey>({ keys: KEYS })
  const merchant = toMerchant(url.filters)
  const status = toStatus(url.filters.status)
  const [draftMerchant, setDraftMerchant] = useState(merchant)
  const [draftStatus, setDraftStatus] = useState(status)

  const search = (): void =>
    url.applyFilters({
      merchantId: draftMerchant?.id,
      merchantCode: draftMerchant?.code,
      merchantName: draftMerchant?.name,
      status: draftStatus
    })
  const clearSearch = (): void => {
    setDraftMerchant(undefined)
    setDraftStatus(undefined)
    url.clearFilters()
  }
  const changePage = (nextPage: number, nextSize: number): void => {
    if (nextSize !== url.size) url.setPageSize(nextSize)
    else url.setPage(nextPage)
  }

  return {
    merchant,
    status,
    draftMerchant,
    draftStatus,
    setDraftMerchant,
    setDraftStatus,
    page: url.page,
    size: url.size,
    search,
    clearSearch,
    changePage
  }
}
