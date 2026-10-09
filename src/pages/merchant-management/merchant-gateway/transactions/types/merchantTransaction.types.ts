import type { Dayjs } from 'dayjs'
import type { PickedEntity } from '@components/index'

export interface MerchantTransactionFilters {
  merchant?: PickedEntity
  keyword: string
  transactionType?: string
  status?: string
  fromDate?: Dayjs
  toDate?: Dayjs
}

export interface MerchantTransactionParams {
  page: number
  size: number
  sourceDomain: string
  includeSummary: true
  partyId?: string
  keyword?: string
  transactionType?: string
  status?: string
  fromDate?: string
  toDate?: string
}
