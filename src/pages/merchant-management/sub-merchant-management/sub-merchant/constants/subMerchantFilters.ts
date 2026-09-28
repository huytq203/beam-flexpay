import type { Dayjs } from 'dayjs'

import type { SubMerchantStatus } from '../types/subMerchant.type'

export interface SubMerchantFiltersValue {
  query: string
  parentMerchantId?: string
  status?: SubMerchantStatus
  createdRange?: [Dayjs, Dayjs]
}

export const EMPTY_SUB_MERCHANT_FILTERS: SubMerchantFiltersValue = {
  query: ''
}
